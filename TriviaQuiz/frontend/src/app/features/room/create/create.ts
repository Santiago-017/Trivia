// src/app/features/room/create/create.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Session } from '../../../services/session';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
})
export class Create {

  loading = false;
  error = "";

  // PLAYERS
  players = 4;
  readonly minPlayers = 1;
  readonly maxPlayers = 8;

  // DIFFICULTY
  difficulties = ['easy', 'medium', 'hard'];
  difficultyIndex = 0;

  // QUESTIONS
  questions = 9;
  readonly minQuestions = 3;
  readonly maxQuestions = 25;
  readonly questionsStep = 3;

  // CATEGORY
  categories = ['GENERAL', 'SCIENCE', 'HISTORY', 'SPORTS'];
  categoryIndex = 0;

  //MODE
  modes = ['coop', 'vs'];
  modeIndex = 0;

  constructor(
    private router: Router, 
    private sessionService: Session
  ) {}

  changePlayers(delta: number) {
    const next = this.players + delta;
    if (next >= this.minPlayers && next <= this.maxPlayers) {
      this.players = next;
    }
  }

  changeDifficulty(delta: number) {
    const len = this.difficulties.length;
    this.difficultyIndex = (this.difficultyIndex + delta + len) % len;
  }

  changeQuestions(delta: number) {
    const next = this.questions + delta * this.questionsStep;
    if (next >= this.minQuestions && next <= this.maxQuestions) {
      this.questions = next;
    }
  }

  changeCategory(delta: number) {
    const len = this.categories.length;
    this.categoryIndex = (this.categoryIndex + delta + len) % len;
  }
  changeMode(delta: number) {
    const len = this.modes.length;
    this.modeIndex = (this.modeIndex + delta + len) % len;
  }

  // FINAL METHOD TO CREATE THE SESSION
  createSession() {
    this.loading = true;
    this.error = "";
    localStorage.setItem('isHost', 'true');

    const dto = {
      players: this.players,
      difficulty: this.difficulties[this.difficultyIndex],
      questions: this.questions,
      category: this.categories[this.categoryIndex],
      mode: this.modes[this.modeIndex]
    };

    this.sessionService.create(dto).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.router.navigate([`/quiz/${resp.session.game_code}`]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.msg ?? "Error creating session";
      }
    });
  }
}
