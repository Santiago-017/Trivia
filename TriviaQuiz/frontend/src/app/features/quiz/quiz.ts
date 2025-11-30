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
        // Aquí puedes avanzar a la siguiente pregunta
      }
    }, 1000);
  }

  selectOption(index: number) {
    this.selectedIndex = index;
  }
}
