// src/app/features/auth/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],  // <--- IMPORTANTE
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register{
  // solo vista por ahora
}
