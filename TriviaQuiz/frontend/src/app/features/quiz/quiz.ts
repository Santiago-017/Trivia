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

  currentQuestionOrder = 0; // el backend usa este "order"
  subs: Subscription[] = [];

  constructor(
    private sessionService: Session,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
  const paramMap = this.route.snapshot.paramMap;

  this.gameCode = paramMap.get('game_code') || '';
  if (!this.gameCode) {
    this.router.navigate(['/room/room-menu']);
    return;
  }

  this.isHost = localStorage.getItem('isHost') === 'true';
  const nickname = localStorage.getItem('nickname') || 'Jugador';
  const userIdStr = localStorage.getItem('userId');
  console.log('userIdStr from localStorage:', userIdStr);
  const userId = userIdStr ? Number(userIdStr) : null;

  if (!userId || Number.isNaN(userId)) {
    this.router.navigate(['/auth/login']);
    return;
  }

  // 1) Unirse a la sala
  this.socketService.joinSession(this.gameCode, userId, nickname);

  // 2) TODOS escuchan nuevas preguntas desde aquí
  this.subs.push(
    this.socketService.onNewQuestion().subscribe((q: any) => {
      this.setQuestion(q);              // 👈 aquí arranca el juego en todos
    })
  );

  // 3) Escuchar respuestas (opcional)
  this.subs.push(
    this.socketService.onPlayerAnswered().subscribe((info: any) => {
      console.log('Respuesta de un jugador:', info);
    })
  );

  this.subs.push(
    this.socketService.onRequestNextQuestion().subscribe((data: any) => {
      console.log('requestNextQuestion recibido:', data);
      if (this.isHost) {
        this.nextQuestion();
      }
    })
  );
}



  // HOST: cargar primera pregunta y avisar por sockets
  startGameAsHost() {
  // Seguridad extra: solo el host debería poder hacer esto
  

  this.gameStarted = true;
  this.currentQuestionOrder = 0;

  this.sessionService.start(this.gameCode).subscribe({
    next: (res: any) => {
      // Guardar el sessionId real que devuelve el back
      this.sessionId = res.sessionId ?? res.session_id ?? null;
      console.log('Quiz → sessionId recibido del back:', this.sessionId);

      const question = res.firstQuestion;
      if (!question) {
        console.error('No se encontró firstQuestion en la respuesta:', res);
        return;
      }

      this.currentQuestionOrder =
        question.questionOrder != null ? question.questionOrder : 0;

      // ❌ Ya NO llamamos setQuestion aquí
      // this.setQuestion(question);

      // ✅ En su lugar, mandamos la pregunta por socket
      if (this.gameCode) {
        this.socketService.sendNextQuestion(this.gameCode, question);
      }
    },
    error: (err) => {
      console.error('Error al iniciar la partida (startSession):', err);
    }
  });
}



  // Mostrar pregunta + arrancar contador
  setQuestion(question: any) {
  this.gameStarted = true;
  console.log('Mostrando pregunta:', question);
  this.question = question.question;

  // 1) Formato de tu backend: { question, correct, options }
  if (Array.isArray(question.options)) {
    this.options = question.options;
  }
  // 2) Formato tipo OpenTDB: { correct_answer, incorrect_answers }
  else if (
    question.correct_answer &&
    Array.isArray(question.incorrect_answers)
  ) {
    this.options = [question.correct_answer, ...question.incorrect_answers];
  } else {
    this.options = [];
  }

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
        this.nextQuestion();
      }
    }, 1000);
  }

  // Solo el HOST debería llamar a esto realmente
  // Solo el HOST debería llamar a esto realmente
nextQuestion() {
  // Solo el host debe ejecutar lógica de backend
  if (!this.isHost) {
    console.warn('nextQuestion llamado por no-host, ignorando.');
    return;
  }

  if (!this.sessionId) {
    console.error('nextQuestion → No hay sessionId aún');
    return;
  }

  this.currentQuestionOrder++;

  this.sessionService
    .nextQuestion(this.sessionId, this.currentQuestionOrder)
    .subscribe({
      next: (res: any) => {
        console.log('Respuesta de nextQuestion:', res);

        if (res.finished) {
          // Solo el host decide ir al scoreboard
          this.router.navigate(['/scoreboard', this.sessionId]);
          return;
        }

        const question = res.question || res;
        if (!question) {
          console.error('No se pudo obtener la siguiente pregunta:', res);
          return;
        }

        if (question.questionOrder != null) {
          this.currentQuestionOrder = question.questionOrder;
        }

        // El host manda la nueva pregunta a TODOS
        if (this.gameCode) {
          this.socketService.sendNextQuestion(this.gameCode, question);
        }
      },
      error: (err) => {
        console.error('Error en nextQuestion (siguiente):', err);
      },
    });
}



  // Cuando el jugador selecciona una opción
  selectOption(index: number) {
    this.selectedIndex = index;
    console.log('Opción seleccionada:', index);
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? Number(userIdStr) : null;
    const selectedOption = this.options[index];  
    // ejemplo: mandar la respuesta por sockets
    if (this.gameCode) {
      this.socketService.sendAnswer(this.gameCode, {
        sessionId: this.sessionId,
        userId: userId,
        questionOrder: this.currentQuestionOrder,
        optionIndex: index,
        selectedOption
      });
    }
    
    if (this.gameCode){
      this.socketService.requestNextQuestion(this.gameCode);
    }
    
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
