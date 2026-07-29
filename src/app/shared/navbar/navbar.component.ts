import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NotificationService } from "../../services/notification.service";

@Component({
    selector: 'nav-bar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
    unreadNotificationsCount = 0;

    constructor(private notificationService: NotificationService) {}

    ngOnInit(): void {
        this.fetchNotificationsCount();
    }

    fetchNotificationsCount(): void {
        setTimeout(() => {
            this.unreadNotificationsCount = 2;
        }, 500);
    }
}
