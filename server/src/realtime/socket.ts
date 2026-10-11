import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import type { AuthTokenPayload } from '../types/index.js';

interface AuthenticatedSocket extends Socket {
  user?: AuthTokenPayload;
}

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  // Authentication Middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      // Allow anonymous socket for public emergency map overview, but mark as unauthenticated
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
      socket.user = decoded;
      return next();
    } catch {
      // Continue unauthenticated
      return next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId;
    const role = socket.user?.role;

    console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${userId || 'Anonymous'}, Role: ${role || 'Public'})`);

    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (role) {
      socket.join(`role:${role}`);
    }

    // Join room for specific blood or organ request
    socket.on('join_request', (requestId: string) => {
      if (requestId) {
        socket.join(`request:${requestId}`);
        console.log(`[Socket.IO] ${socket.id} joined request:${requestId}`);
      }
    });

    socket.on('leave_request', (requestId: string) => {
      if (requestId) {
        socket.leave(`request:${requestId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO is not initialized yet');
  }
  return io;
}

/**
 * Real-time event broadcasting helpers
 */
export function emitEmergencySosBroadcast(sosPayload: any) {
  if (!io) return;
  // Sanitized broadcast for all listening public & donor channels without sensitive PII
  const sanitized = {
    id: sosPayload.id,
    bloodGroup: sosPayload.blood_group,
    componentType: sosPayload.component_type,
    unitsRequired: sosPayload.units_required,
    urgency: sosPayload.urgency,
    hospitalName: sosPayload.hospital_name,
    hospitalCity: sosPayload.hospital_city,
    hospitalLatitude: sosPayload.hospital_latitude,
    hospitalLongitude: sosPayload.hospital_longitude,
    createdAt: sosPayload.created_at || new Date().toISOString(),
  };

  io.emit('emergency_sos_broadcast', sanitized);
  console.log(`[Socket.IO Broadcast] Emergency SOS emitted for request ${sosPayload.id}`);
}

export function emitInventoryUpdate(inventoryItem: any) {
  if (!io) return;
  io.to('role:HOSPITAL').to('role:BLOOD_BANK').to('role:ADMINISTRATOR').emit('inventory_updated', inventoryItem);
}

export function emitRequestStatusUpdate(requestId: string, statusPayload: any) {
  if (!io) return;
  io.to(`request:${requestId}`).emit('request_status_changed', statusPayload);
  io.to('role:HOSPITAL').to('role:ADMINISTRATOR').emit('request_list_refresh', { requestId, ...statusPayload });
}

export function emitNotificationToUser(userId: string, notification: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification_received', notification);
}

export function emitAuditLog(logItem: any) {
  if (!io) return;
  io.to('role:ADMINISTRATOR').emit('audit_log_added', logItem);
}
