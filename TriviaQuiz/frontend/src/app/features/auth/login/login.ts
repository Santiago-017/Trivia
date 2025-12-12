// src/app/features/auth/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  username: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(private authService: Auth, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      alert('Please fill in all fields');
      return;
    }

    this.loading = true;
    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          localStorage.setItem('nickname', this.username);
          // el token ya se guardó en el servicio (tap)
          this.router.navigate(['/room/room-menu']); // o '/lobby', '/home', etc. [web:158][web:167]
        },
        error: (err: any) => {
          this.loading = false;
          alert('Login failed. Please try again.');
          console.error(err);
        }
      });
  }
}
