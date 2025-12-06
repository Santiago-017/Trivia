import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../services/session';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.scss'],
})
export class Quiz implements OnInit, OnDestroy {
  gameStarted = false;
  timer = 10;

  question = '';
  options: string[] = [];
  selectedIndex: number | null = null;

  // Estos deberían venir del router o de otro servicio
  sessionId = 1;          // TODO: reemplazar por el id real de la sala
  userId = 1;             // TODO: id real del usuario logueado
  nickname = 'Jugador';   // TODO: nickname real

  interval: any;
  private subs: Subscription[] = [];

  constructor(
    private sessionService: Session,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // 1. Unirse al "room" de sockets para recibir eventos en tiempo real
    this.socketService.joinSession(this.sessionId, this.userId, this.nickname);

    // 2. Escuchar cuando el servidor diga que la sesión comenzó
    this.subs.push(
      this.socketService.onSessionStarted().subscribe((data: any) => {
        this.gameStarted = true;

        const q = data.firstQuestion?.payload ?? data.firstQuestion;
        this.setQuestionFromPayload(q);
      })
    );

    // 3. Escuchar nuevas preguntas
    this.subs.push(
      this.socketService.onNewQuestion().subscribe((data: any) => {
        const q = data.payload ?? data;
        this.setQuestionFromPayload(q);
      })
    );

    // 4. Escuchar cuando algún jugador responda (para marcador, etc.)
    this.subs.push(
      this.socketService.onPlayerAnswered().subscribe((info: any) => {
        console.log('Respuesta de un jugador:', info);
        // aquí podrías actualizar un scoreboard local
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // HOST: inicia el juego.
  // 1) HTTP -> crea preguntas en BD (llama a la API externa)
  // 2) Socket -> avisa a todos que la sesión comenzó
  startGame() {
    this.sessionService.start(this.sessionId).subscribe({
      next: (resp: any) => {
        this.gameStarted = true;

        const q = resp.firstQuestion?.payload;
        this.setQuestionFromPayload(q);

        console.log('RESPUESTA DEL BACK:', resp);
        console.log('PRIMERA PREGUNTA:', resp.firstQuestion.payload.question);

        // Notificar a los demás jugadores que la sesión ha comenzado
        this.socketService.startSession(this.sessionId);
      },
      error: (err) => console.error(err),
    });
  }

  private setQuestionFromPayload(q: any) {
    this.question = q?.question || '';
    this.options = q?.options || [];
    this.startTimer();
  }

  startTimer() {
    this.timer = 10;

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.timer--;

      if (this.timer === 0) {
        clearInterval(this.interval);
        this.selectedIndex = null;
        // Aquí puedes avanzar a la siguiente pregunta
      }
    }, 1000);
  }

  selectOption(index: number) {
    this.selectedIndex = index;
    // Más adelante:
    // - mandar la respuesta al backend por HTTP (/sessions/:id/answer)
    // - emitirla por sockets: this.socketService.sendAnswer(...)
  }
}

