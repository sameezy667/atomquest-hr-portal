/**
 * @file notifications.ts
 * @description Notification management API functions
 * @module lib/api
 */
import { supabase } from '../supabase';
import type { Database } from '../types/database';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

/**
 * Fetch notifications for a user
 */
export async function fetchNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

  if (error) throw error;
  return data as Notification[];
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

/**
 * Create a notification (typically called by backend triggers, but can be used for manual notifications)
 */
export async function createNotification(notificationData: NotificationInsert) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

/**
 * Send email notification via Supabase Edge Function
 * This is a wrapper around the send-email edge function
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  body: string,
  type: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        body,
        type,
      },
    });

    if (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw - email failures shouldn't break the app
    return { success: false, error };
  }
}
