import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { NotificationService } from "../../services/notification.service";
import { ProfileService } from "../../services/profile.service";

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
    userAvatar: string | null = null;
    isLoggedIn: boolean = false;

    constructor(
        private notificationService: NotificationService,
        private profileService: ProfileService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.updateState();
    }

    ngOnInit(): void {
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
            this.updateState();

            if (this.isLoggedIn) {
                this.fetchNotificationsCount();
                this.getAvatar();
            }
            this.cdr.detectChanges();
        });
    }

    updateState() {
        if (localStorage.getItem('token')) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
    }

    getAvatar(): void {
        this.profileService.getProfileData().subscribe({
            next: (res: any) => {
                const data = res?.data ?? res;
                if (data?.avatarUrl) {
                    this.userAvatar = data.avatarUrl;
                    this.cdr.detectChanges();
                }
            },
            error: () => { }
        });
    }

    fetchNotificationsCount(): void {
        setTimeout(() => {
            this.unreadNotificationsCount = 2;
            this.cdr.detectChanges();
        }, 500);
    }
}
