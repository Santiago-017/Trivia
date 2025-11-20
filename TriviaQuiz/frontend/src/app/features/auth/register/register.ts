// src/app/features/auth/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule],  // <--- IMPORTANTE
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register{
  username: string = '';
  password: string = '';
  email: string = '';
  confirmPassword: string = '';
  loading: boolean = false;

  constructor(private authService: Auth, private router: Router) {}

  register() {
  if (!this.username || !this.password || !this.email || !this.confirmPassword) {
    alert('Please fill in all fields');
    return;
  }
  if (this.password !== this.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  this.loading = true;
  this.authService.register({ username: this.username, password: this.password, email: this.email })
    .subscribe({
      next: (res:any) => {
        this.loading = false;
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err:any) => {
        this.loading = false;
        alert('Registration failed. Please try again.');
      }
    });
}
}
