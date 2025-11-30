import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Session } from '../../../services/session';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './join.html',
  styleUrls: ['./join.scss'],
})
export class Join {
  sessionId = '';
  nickname = '';
  loading = false;
  error = '';

  constructor(
    private sessionService: Session,
    private router: Router
  ) {}

  joinSession() {
    this.error = '';
    this.loading = true;

    this.sessionService.join(this.sessionId, this.nickname).subscribe({
      next: () => {
        this.loading = false;
        // Navegar a la sala; usa la ruta que tengas definida:
        this.router.navigate(['/quiz', this.sessionId]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.msg ?? 'Error joining session';
      }
    });
  }
}
