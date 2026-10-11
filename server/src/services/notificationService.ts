import { query, execute } from '../db/connection.js';
import { emitNotificationToUser } from '../realtime/socket.js';
import type { NotificationEntity, NotificationType, NotificationChannel } from '../types/index.js';

export async function createNotification(params: {
  recipientUserId: string;
  title: string;
  message: string;
  type: NotificationType;
  channel?: NotificationChannel;
  actionUrl?: string;
}): Promise<NotificationEntity> {
  const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const channel = params.channel || 'IN_APP';
  const actionUrl = params.actionUrl || null;
  const createdAt = new Date().toISOString();

  await execute(
    `INSERT INTO notifications (id, recipient_user_id, title, message, type, is_read, delivery_status, channel, action_url)
     VALUES (?, ?, ?, ?, ?, 0, 'DELIVERED', ?, ?)`,
    [id, params.recipientUserId, params.title, params.message, params.type, channel, actionUrl]
  );

  const notif: NotificationEntity = {
    id,
    recipient_user_id: params.recipientUserId,
    title: params.title,
    message: params.message,
    type: params.type,
    is_read: false,
    delivery_status: 'DELIVERED',
    channel,
    action_url: actionUrl,
    created_at: createdAt,
  };

  emitNotificationToUser(params.recipientUserId, notif);
  return notif;
}

export async function getUserNotifications(userId: string, unreadOnly = false): Promise<NotificationEntity[]> {
  let sql = `SELECT * FROM notifications WHERE recipient_user_id = ?`;
  const params: any[] = [userId];

  if (unreadOnly) {
    sql += ` AND is_read = 0`;
  }

  sql += ` ORDER BY created_at DESC LIMIT 50`;
  return query<NotificationEntity>(sql, params);
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  const result = await execute(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_user_id = ?`,
    [notificationId, userId]
  );
  return result.affectedRows > 0;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const result = await execute(
    `UPDATE notifications SET is_read = 1 WHERE recipient_user_id = ?`,
    [userId]
  );
  return result.affectedRows > 0;
}
