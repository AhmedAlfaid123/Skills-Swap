export interface Notification {
  id: string;
  type: 'new_request' | 'request_accepted' | 'request_rejected' | string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
