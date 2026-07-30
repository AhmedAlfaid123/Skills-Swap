import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.loading = true;
    
    // Simulate API call based on Day-1 Mock requirement
    setTimeout(() => {
      this.notifications = [
        { id: '101', type: 'new_request', message: 'Alice wants to learn React from you!', isRead: false, createdAt: new Date().toISOString() },
        { id: '102', type: 'request_accepted', message: 'Bob accepted your request for Node.js.', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '103', type: 'new_request', message: 'Charlie matched with your Angular skill.', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() }
      ];
      this.loading = false;
    }, 500);
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    
    // In real app: this.notificationService.markAsRead(notification.id).subscribe(...)
    notification.isRead = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => {
      if (!n.isRead) {
        this.markAsRead(n);
      }
    });
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getIconForType(type: string): string {
    switch(type) {
      case 'new_request': return '📩';
      case 'request_accepted': return '✅';
      case 'request_rejected': return '❌';
      default: return '🔔';
    }
  }
}
