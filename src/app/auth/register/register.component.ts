import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Auth } from "../../services/auth";
import {Router} from "@angular/router";
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class registerComponent {
    firstName = "";
    lastName = "";
    email = "";
    password = "";
    confirmPassword = "";
    firstNameError = "";
    lastNameError = "";
    emailError = "";
    passwordError = "";
    confirmPasswordError = "";
    serverError = "";
    successMessage = "";
    constructor(private auth: Auth , private router: Router) { }
    register() {
        this.firstNameError = "";
        this.lastNameError = "";
        this.emailError = "";
        this.passwordError = "";
        this.confirmPasswordError = "";
        this.serverError = "";
        this.successMessage = "";
        if (!this.firstName.trim()) {
            this.firstNameError = "First name is required";
        }
        else if (this.firstName.trim().length < 3) {
            this.firstNameError = "First name must be at least 3 characters";
        }
        if (!this.lastName.trim()) {
            this.lastNameError = "Last name is required";
        }
        else if (this.lastName.trim().length < 3) {
            this.lastNameError = "Last name must be at least 3 characters";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email.trim()) {
            this.emailError = "Email is required";
        }
        else if (!emailRegex.test(this.email)) {
            this.emailError = "Invalid email format";
        }
        if (!this.password) {
            this.passwordError = "Password is required";
        }
        else if (this.password.length < 8) {
            this.passwordError = "Password must be at least 8 characters";
        }
        if (!this.confirmPassword) {
            this.confirmPasswordError = "Please confirm your password";
        }
        else if (this.password !== this.confirmPassword) {
            this.confirmPasswordError = "Passwords do not match";
        }
        if (
            this.firstNameError ||
            this.lastNameError ||
            this.emailError ||
            this.passwordError ||
            this.confirmPasswordError
        ) {
            return;
        }
        const user = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword
        };
        console.log(user);
        this.auth.register(user).subscribe({
            next: (res: any) => {
                this.successMessage = "Account created successfully.";
                this.firstName = "";
                this.lastName = "";
                this.email = "";
                this.password = "";
                this.confirmPassword = "";
                console.log(res);
                this.router.navigate(['/profile']);
            },
            error: (err) => {
                const message = err.error?.message || "Something went wrong";
                if(message === "Email already exists"){
                    this.emailError = message;
                }
                else{
                    this.serverError = message;
                }
            }
        });
    }
}