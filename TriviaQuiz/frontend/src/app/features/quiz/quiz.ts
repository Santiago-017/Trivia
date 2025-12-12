// src/app/pages/quiz/quiz.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../services/session';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

type Mode = 'vs' | 'coop';

type PlayerRow = {
  userId: number;
  nickname: string;
  score: number;
  streak?: number;
};

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
  codeCopied = false;
  question: any = null;
  options: string[] = [];
  selectedIndex: number | null = null;

  sessionId!: number | string;
  gameCode!: string;
  isHost = false;

  mode: Mode = 'vs';
  teamScore = 0;
  teamStreak = 0;
  players: PlayerRow[] = [];

  currentQuestionOrder = 0;
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

    const storedMode = (localStorage.getItem('mode') || 'vs').toLowerCase();
    this.mode = storedMode === 'coop' ? 'coop' : 'vs';

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

    // ✅ (NUEVO) pedir snapshot inicial apenas entro
    if (this.mode === 'vs') {
      this.requestPlayersSnapshot();
    }

    // ✅ (NUEVO) escuchar snapshot de jugadores (lista completa)
    this.subs.push(
      this.socketService.onPlayersSnapshot().subscribe((list: any[]) => {
        if (this.mode !== 'vs') return;
        this.upsertPlayersFromSnapshot(list);
      })
    );

    // 1.1) Escuchar cuando entra gente (para llenar players en VS)
    this.subs.push(
      this.socketService.onPlayerJoined().subscribe((data: any) => {
        if (this.mode !== 'vs') return;

        const uid = Number(data.userId);
        if (!uid || Number.isNaN(uid)) return;

        const exists = this.players.some(p => p.userId === uid);
        if (!exists) {
          this.players.push({
            userId: uid,
            nickname: data.nickname || `Jugador ${uid}`,
            score: 0,
            streak: 0
          });
          this.players.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        }

        // ✅ (NUEVO) cuando alguien entra, vuelvo a pedir snapshot para sincronizar
        this.requestPlayersSnapshot();
      })
    );

    // 2) TODOS escuchan nuevas preguntas
    this.subs.push(
      this.socketService.onNewQuestion().subscribe((q: any) => {
        this.setQuestion(q);
      })
    );

    // 3) Escuchar validaciones de respuesta y actualizar scoreboard
    this.subs.push(
      this.socketService.onPlayerAnswered().subscribe((info: any) => {
        console.log('playerAnswered:', info);

        const mode = (info?.mode || this.mode).toLowerCase();
        this.mode = mode === 'coop' ? 'coop' : 'vs';

        if (this.mode === 'coop') {
          if (typeof info.teamScore === 'number') this.teamScore = info.teamScore;
          if (typeof info.teamStreak === 'number') this.teamStreak = info.teamStreak;
          return;
        }

        const uid = Number(info.userId);
        if (!uid || Number.isNaN(uid)) return;

        let p = this.players.find(x => x.userId === uid);
        if (!p) {
          p = { userId: uid, nickname: `Jugador ${uid}`, score: 0, streak: 0 };
          this.players.push(p);
        }

        if (typeof info.newScore === 'number') p.score = info.newScore;
        if (typeof info.streak === 'number') p.streak = info.streak;

        this.players.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
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

    this.subs.push(
      this.socketService.onGameFinished().subscribe((data: any) => {
        console.log('gameFinished recibido:', data);
        this.router.navigate(['/scoreboard', this.gameCode]);
      })
    );
  }

  // ✅ (NUEVO) pide al servidor la lista actual de jugadores en la sala
  private requestPlayersSnapshot() {
    if (!this.gameCode) return;
    // Debe existir en tu SocketService
    this.socketService.requestPlayersSnapshot(this.gameCode);
  }

  // ✅ (NUEVO) normaliza + evita duplicados + aplica scores si vienen
  private upsertPlayersFromSnapshot(list: any[]) {
    const incoming: PlayerRow[] = (Array.isArray(list) ? list : [])
      .map((x: any) => ({
        userId: Number(x.userId ?? x.user_id),
        nickname: x.nickname ?? x.name ?? `Jugador ${x.userId ?? x.user_id}`,
        score: Number(x.score ?? 0),
        streak: Number(x.streak ?? 0),
      }))
      .filter(p => p.userId && !Number.isNaN(p.userId));

    // Reemplazo total (más simple y evita inconsistencias)
    this.players = incoming;

    this.players.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  // HOST: cargar primera pregunta y avisar por sockets
  startGameAsHost() {
    if (!this.isHost) {
      console.warn('startGameAsHost llamado por no-host, ignorando.');
      return;
    }

    this.gameStarted = true;
    this.currentQuestionOrder = 0;

    this.sessionService.start(this.gameCode).subscribe({
      next: (res: any) => {
        this.sessionId = res.sessionId ?? res.session_id ?? null;
        console.log('Quiz → sessionId recibido del back:', this.sessionId);

        const question = res.firstQuestion;
        if (!question) {
          console.error('No se encontró firstQuestion en la respuesta:', res);
          return;
        }

        this.currentQuestionOrder =
          question.questionOrder != null ? question.questionOrder : 0;

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
    if (question?.questionOrder != null) {
      this.currentQuestionOrder = Number(question.questionOrder);
    }

    console.log('Mostrando pregunta:', question);
    this.question = question.question;

    if (Array.isArray(question.options)) {
      this.options = question.options;
    } else if (question.correct_answer && Array.isArray(question.incorrect_answers)) {
      this.options = [question.correct_answer, ...question.incorrect_answers];
    } else {
      this.options = [];
    }

    this.selectedIndex = null;
    this.startTimer();
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timer = 10;

    this.timerId = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerId);

        if (this.isHost) {
          this.nextQuestion();
        } else {
          if (this.gameCode) this.socketService.requestNextQuestion(this.gameCode);
        }
      }
    }, 1000);
  }

  nextQuestion() {
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
            this.socketService.finishGame(this.gameCode, this.sessionId);
            console.log('Partida finalizada. Enviando gameFinished.', this.gameCode, this.sessionId);
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

          if (this.gameCode) {
            const qToSend = { ...question, questionOrder: this.currentQuestionOrder };
            this.socketService.sendNextQuestion(this.gameCode, qToSend);
          }
        },
        error: (err) => {
          console.error('Error en nextQuestion (siguiente):', err);
        },
      });
  }

  selectOption(index: number) {
    this.selectedIndex = index;
    console.log('Opción seleccionada:', index);

    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? Number(userIdStr) : null;
    if (!userId || Number.isNaN(userId)) return;

    const selectedOption = this.options[index];

    if (this.gameCode) {
      this.socketService.sendAnswer(this.gameCode, {
        userId: userId,
        questionOrder: this.currentQuestionOrder,
        selectedOption
      });
    }

    if (this.gameCode) {
      this.socketService.requestNextQuestion(this.gameCode);
    }
  }
  copyRoomCode() {
    if (!this.gameCode) return;
    navigator.clipboard.writeText(this.gameCode).then(() => {
      this.codeCopied = true;
      setTimeout(() => {
        this.codeCopied = false;
      }, 2000);
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.timerId) clearInterval(this.timerId);
  }
}
