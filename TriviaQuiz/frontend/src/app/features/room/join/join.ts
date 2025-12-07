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
  nickname = '';
  loading = false;
  error = '';

  constructor(
    private sessionService: Session,
    private router: Router,
    private socketService: SocketService
  ) {}

  joinSession() {
    this.error = '';

    if (!this.nickname.trim()) {
      this.error = 'Debes ingresar un nickname';
      return;
    }

    if (!this.gameCode.trim()) {
      this.error = 'Debes ingresar el código de la partida';
      return;
    }

    this.loading = true;

    this.sessionService.joinByCode(this.gameCode, this.nickname).subscribe({
      next: (res: any) => {
        this.loading = false;

        console.log('joinByCode response:', res);

        // Según tu respuesta actual:
        // { ok: true, gameCode: '0FP0AF', player: { id, sessionId, userId, ... } }
        const player = res.player || {};
        const sessionIdFromRes = player.sessionId;
        const gameCodeFromRes = res.gameCode || this.gameCode;
        const playerIdFromRes = player.id ?? player.userId;

        if (!sessionIdFromRes) {
          console.error(
            'No se pudo determinar sessionId desde la respuesta:',
            res
          );
          this.error =
            'Error interno: sessionId inválido en la respuesta del servidor';
          return;
        }

        // Guardar info para el resto de pantallas
        localStorage.setItem('sessionId', String(sessionIdFromRes));
        localStorage.setItem('gameCode', String(gameCodeFromRes));
        localStorage.setItem('nickname', this.nickname);
        localStorage.setItem('isHost', 'false');
        if (playerIdFromRes != null) {
          localStorage.setItem('userId', String(playerIdFromRes));
        }

        // Unirse a la sala de sockets
        this.socketService.joinSession(
          String(gameCodeFromRes),
          playerIdFromRes ?? sessionIdFromRes,
          this.nickname
        );

        // 👉 Redirigir a la sala (quiz)
        this.router.navigate(['/quiz', sessionIdFromRes]);
      },
      error: (err) => {
        this.loading = false;
        console.error('joinByCode error:', err);
        this.error =
          err.error?.message ||
          err.error?.msg ||
          'Error al unirse a la sesión';
      }
    });
  }
}
