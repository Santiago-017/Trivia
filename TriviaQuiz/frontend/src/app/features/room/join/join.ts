import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Session } from '../../../services/session';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './join.html',
  styleUrls: ['./join.scss'],
})
export class Join {
  gameCode = '';
  loading = false;
  error = '';

  private nickname = '';

  constructor(
    private sessionService: Session,
    private router: Router,
    private socketService: SocketService
  ) {
    // ✅ Obtener nickname desde login
    this.nickname = localStorage.getItem('nickname') || '';
  }

  joinSession() {
    this.error = '';

    if (!this.nickname) {
      this.error = 'You must be logged in to join a room';
      return;
    }

    if (!this.gameCode.trim()) {
      this.error = 'You must enter the room code';
      return;
    }

    this.loading = true;

    this.sessionService.joinByCode(this.gameCode, this.nickname).subscribe({
      next: (res: any) => {
        this.loading = false;
        localStorage.removeItem('isHost');

        console.log('joinByCode response:', res);

        const player = res.player || {};
        const sessionIdFromRes = player.sessionId;
        const gameCodeFromRes = res.gameCode || this.gameCode;
        const playerIdFromRes = player.userId;

        if (!sessionIdFromRes) {
          console.error('Invalid sessionId:', res);
          this.error = 'Internal error: invalid session';
          return;
        }

        // Guardar info para el resto de pantallas
        localStorage.setItem('sessionId', String(sessionIdFromRes));
        localStorage.setItem('gameCode', String(gameCodeFromRes));
        localStorage.setItem('nickname', this.nickname);
        localStorage.setItem('isHost', 'false');

        // Unirse a la sala de sockets
        this.socketService.joinSession(
          String(gameCodeFromRes),
          playerIdFromRes,
          this.nickname
        );

        // 👉 Ir al quiz
        this.router.navigate(['/quiz', gameCodeFromRes]);
      },
      error: (err) => {
        this.loading = false;
        console.error('joinByCode error:', err);
        this.error =
          err.error?.message ||
          err.error?.msg ||
          'Failed to join the room';
      }
    });
  }
}
