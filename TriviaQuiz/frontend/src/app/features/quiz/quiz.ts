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
  // 🔹 1. Intentar leer el ID de la URL con varios nombres posibles
  const paramMap = this.route.snapshot.paramMap;

  // Soporta rutas tipo /quiz/:sessionId o /quiz/:id
  let routeIdStr =
    paramMap.get('sessionId') ||
    paramMap.get('id') ||
    paramMap.get('session_id'); // por si la ruta está así

  // 🔹 2. Intentar leer de localStorage
  const storedIdStr = localStorage.getItem('sessionId');

  // 🔹 3. Elegir el mejor valor disponible
  let idStr: string | null = null;

  if (routeIdStr && routeIdStr !== 'null' && routeIdStr !== 'undefined') {
    idStr = routeIdStr;
  } else if (
    storedIdStr &&
    storedIdStr !== 'null' &&
    storedIdStr !== 'undefined'
  ) {
    idStr = storedIdStr;
  }

  if (!idStr) {
    console.error(
      'Quiz → No se pudo determinar sessionId (viene null/undefined).',
      { routeIdStr, storedIdStr }
    );
    // No rompemos la app, solo volvemos al menú de salas
    this.router.navigate(['/room/room-menu']);
    return;
  }

  // Aquí ya tenemos un ID válido
  this.sessionId = idStr;
  console.log('Quiz → sessionId usado:', this.sessionId);

  // 🔹 4. Lo demás igual que antes
  this.gameCode = localStorage.getItem('gameCode') || '';
  this.isHost = localStorage.getItem('isHost') === 'true';

  const nickname = localStorage.getItem('nickname') || 'Jugador';
  const userIdStr = localStorage.getItem('userId');
  const userId = userIdStr ? Number(userIdStr) : (this.sessionId as any);

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

  // Ahora SÍ llamamos al endpoint de iniciar sesión
  this.sessionService.start(this.sessionId).subscribe({
    next: (res: any) => {
      console.log('Respuesta de startSession:', res);

      // La pregunta viene en res.firstQuestion
      const question = res.firstQuestion;

      if (!question) {
        console.error('No se encontró firstQuestion en la respuesta:', res);
        return;
      }

      // Si el back incluye questionOrder, úsalo; si no, asumimos 0
      if (question.questionOrder != null) {
        this.currentQuestionOrder = question.questionOrder;
      } else {
        this.currentQuestionOrder = 0;
      }

      // Mostrar la pregunta en pantalla
      this.setQuestion(question);

      // Avisar a todos los clientes por sockets
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
        if (this.isHost) {
          this.nextQuestion();
        }
      }
    }, 1000);
  }

  // Solo el HOST debería llamar a esto realmente
  // Solo el HOST debería llamar a esto realmente
nextQuestion() {
  this.currentQuestionOrder++;

  this.sessionService
    .nextQuestion(this.sessionId, this.currentQuestionOrder)
    .subscribe({
      next: (res: any) => {
        console.log('Respuesta de nextQuestion:', res);

        if (res.finished) {
          this.router.navigate(['/scoreboard', this.sessionId]);
          return;
        }

        // El back debe devolver { finished: false, question: {...} }
        const question = res.question || res;

        if (!question) {
          console.error('No se pudo obtener la siguiente pregunta:', res);
          return;
        }

        // Si viene questionOrder, lo sincronizamos por si acaso
        if (question.questionOrder != null) {
          this.currentQuestionOrder = question.questionOrder;
        }

        this.setQuestion(question);

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

    // ejemplo: mandar la respuesta por sockets
    if (this.gameCode) {
      this.socketService.sendAnswer(this.gameCode, {
        sessionId: this.sessionId,
        questionOrder: this.currentQuestionOrder,
        optionIndex: index,
      });
    }
    
      this.nextQuestion();
    
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
