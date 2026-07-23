import { request } from "@/lib/api";

export interface NotificationDto {
  id: string;
  student_id: string;
  organization_id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  is_read: boolean;
  createdAt: string;
}

export const notificationApi = {
  list: () => request<NotificationDto[]>('/notifications'),

  unreadCount: () => request<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllAsRead: () =>
    request<{ message: string }>('/notifications/read-all', { method: 'PUT' }),
};