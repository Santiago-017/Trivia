// src/app/features/auth/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';   // 👈 IMPORTANTE

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],          // 👈 AÑADIR RouterModule
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  // Sin lógica por ahora
}
