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
    userName: string = '';
    isLoggedIn: boolean = false;
    showProfileMenu: boolean = false;
    avatarLoading: boolean = false;
    private avatarLoaded: boolean = false;

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

                if (!this.avatarLoaded) {
                    this.getAvatar();
                }
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

    toggleProfileMenu(): void {
        if (!this.showProfileMenu) {
            this.showProfileMenu = true;
        } else {
            this.showProfileMenu = false;
        }
    }

    closeProfileMenu(): void {
        this.showProfileMenu = false;
    }

    logout(): void {
        localStorage.removeItem('token');
        this.userAvatar = null;
        this.userName = '';
        this.avatarLoaded = false;
        this.isLoggedIn = false;
        this.showProfileMenu = false;
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
    }

    getAvatar(): void {
        this.avatarLoading = true;
        this.profileService.getProfileData().subscribe({
            next: (res: any) => {
                const data = res?.data ?? res;
                if (data?.avatarUrl) {
                    this.userAvatar = data.avatarUrl;
                } else {
                    this.userAvatar = null;
                }

                this.userName = data?.name ?? '';
                this.avatarLoaded = true;
                this.avatarLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.avatarLoading = false;
                this.userAvatar = null;
                this.userName = '';
                this.avatarLoaded = true;
                this.cdr.detectChanges();
            }
        });
    }

    fetchNotificationsCount(): void {
        setTimeout(() => {
            this.unreadNotificationsCount = 2;
            this.cdr.detectChanges();
        }, 500);
    }
}
