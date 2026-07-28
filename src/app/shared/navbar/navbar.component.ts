import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NotificationService } from "../../services/notification.service";

@Component({
    selector: 'nav-bar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
    unreadNotificationsCount = 0;

    constructor(private notificationService: NotificationService) {}

    ngOnInit(): void {
        this.fetchNotificationsCount();
        
        // In a real app, this might listen to a WebSocket or polling interval
        // to update the notification bell icon when new notifications arrive.
    }

    fetchNotificationsCount(): void {
        // Simulate a small delay for the mock
        setTimeout(() => {
            // For the mock, just set it to a fixed number as we don't have a real store yet
            this.unreadNotificationsCount = 2;
        }, 500);
    }
}