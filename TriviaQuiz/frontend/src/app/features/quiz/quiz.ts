// src/app/pages/quiz/quiz.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../services/session';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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
  timerId: any;

  question: any = null;
  options: string[] = [];
  selectedIndex: number | null = null;

  sessionId!: number | string;
  gameCode!: string;
  isHost = false;

  currentQuestionOrder = 1; // el backend usa este "order"
  subs: Subscription[] = [];

  constructor(
    private sessionService: Session,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Recuperar la sesión y datos básicos
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;
    this.gameCode = localStorage.getItem('gameCode') || '';
    this.isHost = localStorage.getItem('isHost') === 'true';

    const nickname = localStorage.getItem('nickname') || 'Jugador';
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? Number(userIdStr) : this.sessionId;

    // 2. Unirse a la sala de sockets por gameCode
    if (this.gameCode) {
      this.socketService.joinSession(this.gameCode, userId, nickname);
    }

    // 3. Escuchar nuevas preguntas por sockets
    this.subs.push(
      this.socketService.onNewQuestion().subscribe((q: any) => {
        this.setQuestion(q);
      })
    );

    // 4. Si soy el HOST, arranco la partida
    if (this.isHost) {
      this.startGameAsHost();
    }

    // 5. (Opcional) escuchar respuestas
    this.subs.push(
      this.socketService.onPlayerAnswered().subscribe((info: any) => {
        console.log('Respuesta de un jugador:', info);
        // aquí podrías actualizar un scoreboard local
      })
    );
  }

  // HOST: cargar primera pregunta y avisar por sockets
  startGameAsHost() {
    this.gameStarted = true;
    this.currentQuestionOrder = 0;

    this.sessionService
      .nextQuestion(this.sessionId, this.currentQuestionOrder)
      .subscribe((res: any) => {
        // ajusta a la estructura real que devuelve tu back
        if (res.finished) {
          this.router.navigate(['/scoreboard', this.sessionId]);
          return;
        }

        const question = res.question || res; // depende de cómo responda el back
        this.setQuestion(question);

        // avisar a todos los clientes
        if (this.gameCode) {
          this.socketService.sendNextQuestion(this.gameCode, question);
        }
      });
  }

  // Mostrar pregunta + arrancar contador
  setQuestion(question: any) {
    this.question = question;
    this.options = question.options || question.incorrect_answers
      ? [question.correct_answer, ...question.incorrect_answers]
      : question.options;

    this.selectedIndex = null;
    this.startTimer();
  }

  startTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timer = 10;

    this.timerId = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerId);
        // cuando se acaba el tiempo el HOST puede avanzar de pregunta
        if (this.isHost) {
          this.nextQuestion();
        }
      }
    }, 1000);
  }

  // Solo el HOST debería llamar a esto realmente
  nextQuestion() {
    this.currentQuestionOrder++;

    this.sessionService
      .nextQuestion(this.sessionId, this.currentQuestionOrder)
      .subscribe((res: any) => {
        if (res.finished) {
          this.router.navigate(['/scoreboard', this.sessionId]);
          return;
        }

        const question = res.question || res;
        this.setQuestion(question);

        if (this.gameCode) {
          this.socketService.sendNextQuestion(this.gameCode, question);
        }
      });
  }

  // Cuando el jugador selecciona una opción
  selectOption(index: number) {
    this.selectedIndex = index;

    // ejemplo: mandar la respuesta por sockets
    if (this.gameCode) {
      this.socketService.sendAnswer(this.gameCode, {
        sessionId: this.sessionId,
        questionOrder: this.currentQuestionOrder,
        optionIndex: index,
      });
    }

    // si quieres que solo el host avance:
    if (this.isHost) {
      this.nextQuestion();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
