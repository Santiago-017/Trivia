import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../services/session';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.scss'],
})
export class Quiz {
  gameStarted = false;
  timer = 10;

  question = '';
  options: string[] = [];
  selectedIndex: number | null = null;
  currentQuestionOrder = 0;
  sessionId = 1; // <- luego se reemplaza por la real de la sala creada

  interval: any;

  constructor(private sessionService: Session) {}

  startGame() {
    this.sessionService.start(this.sessionId).subscribe({
      next: (resp: any) => {
        this.gameStarted = true;

        const q = resp.firstQuestion?.payload;

        this.question = q?.question || '';
        this.options = q?.options || [];
        console.log("RESPUESTA DEL BACK:", resp);
        console.log("PRIMERA PREGUNTA:", resp.firstQuestion.payload.question);

        this.startTimer();
      },
      error: (err) => console.error(err),
    });
  }

  startTimer() {
    this.timer = 10;

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.timer--;

      if (this.timer === 0) {
        clearInterval(this.interval);
        this.selectedIndex = null;
        this.goToNextQuestion();
      }
    }, 1000);
  }
  loadQuestion(data : any) {
    const q = data.question || data.firstQuestion;
    if (!q) {
      this.question = "juego terminado";
      this.options = [];
      this.gameStarted = false;
      return;
    }
    this.question = q.payload.question;
    this.options = q.payload.options;
    this.startTimer();
  }
  goToNextQuestion() {
    this.currentQuestionOrder++;
    this.sessionService.nextQuestion(this.sessionId, this.currentQuestionOrder).subscribe({
      next: (resp: any) => {
        if (resp.status === 'finished') {
          this.question = "El juego ha terminado.";
          this.options = [];
          this.gameStarted = false;
          return;
        }
        this.loadQuestion(resp);
      },
      error: (err) => console.error(err),
    });
  }

  selectOption(index: number) {
    this.selectedIndex = index;
    clearInterval(this.interval);
    this.goToNextQuestion();
  }
}
