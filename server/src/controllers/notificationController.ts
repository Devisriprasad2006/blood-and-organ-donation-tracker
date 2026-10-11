import { Response, NextFunction } from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../services/notificationService.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export async function getUserNotificationsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const unreadOnly = req.query.unread === 'true';
    const notifications = await getUserNotifications(req.user.userId, unreadOnly);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function markAsReadHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    await markNotificationAsRead(id, req.user.userId);
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (err: any) {
    next(err);
  }
}

export async function markAllAsReadHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    await markAllNotificationsAsRead(req.user.userId);
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err: any) {
    next(err);
  }
}
