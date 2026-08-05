import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.notifications = [
        { id: '101', type: 'new_request', message: 'Alice wants to learn React from you!', isRead: false, createdAt: new Date().toISOString() },
        { id: '102', type: 'request_accepted', message: 'Bob accepted your request for Node.js.', isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '103', type: 'new_request', message: 'Charlie matched with your Angular skill.', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() }
      ];
      this.loading = false;
      this.cdr.detectChanges();
    }, 500);
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    
    notification.isRead = true;
    this.cdr.detectChanges();
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => {
      if (!n.isRead) {
        this.markAsRead(n);
      }
    });
    this.cdr.detectChanges();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getIconForType(type: string): string {
    switch(type) {
      case 'new_request': return 'mdi:email-outline';
      case 'request_accepted': return 'mdi:check-circle-outline';
      case 'request_rejected': return 'mdi:close-circle-outline';
      default: return 'mdi:bell-outline';
    }
  }
}
