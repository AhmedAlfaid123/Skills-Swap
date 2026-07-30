import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Auth } from "../../services/auth";
import {Router} from '@angular/router';
@Component({
    selector: 'app-login',
    standalone:true,
    imports: [RouterLink, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class loginComponent {
    email = "";
    password = "";
    emailError = "";
    passwordError = "";
    serverError = "";
    successMessage = "";
    constructor(private auth: Auth , private router:Router) { }
    login() {
        this.emailError = "";
        this.passwordError = "";
        this.serverError = "";
        this.successMessage = "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email.trim()) {
            this.emailError = "Email is required";
        } else if (!emailRegex.test(this.email)) {
            this.emailError = "Invalid email format";
        }
        if (!this.password) {
            this.passwordError = "Password is required";
        }
        if (this.emailError || this.passwordError) {
            return;
        }
        const user = {
            email: this.email,
            password: this.password
        };
        this.auth.login(user).subscribe({
            next: (res: any) => {
                localStorage.setItem("token", res.token);
                this.successMessage = "Login successful.";
                this.email = "";
                this.password = "";
                console.log(res);
                this.router.navigate(['/home']);
            },
            error: (err) => {
                const message = err.error?.message || "Something went wrong";
                if (
                    message === "Invalid email or password" ||
                    message === "Email and password are required"
                ) {
                    this.serverError = message;
                } else {
                    this.serverError = message;
                }
                console.log(err);
            }
        });
    }
}