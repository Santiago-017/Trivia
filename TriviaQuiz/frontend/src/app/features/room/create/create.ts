// src/app/features/room/create/create.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
})
export class Create {
  // # PLAYERS
  players = 4;
  readonly minPlayers = 1;
  readonly maxPlayers = 8;

  // DIFFICULTY
  difficulties = ['EASY', 'MEDIUM', 'HARD'];
  difficultyIndex = 0;

  // # QUESTIONS
  questions = 9;
  readonly minQuestions = 3;
  readonly maxQuestions = 25;
  readonly questionsStep = 3;

  // CATEGORY
  categories = ['GENERAL', 'SCIENCE', 'HISTORY', 'SPORTS'];
  categoryIndex = 0;

  changePlayers(delta: number): void {
    const next = this.players + delta;
    if (next >= this.minPlayers && next <= this.maxPlayers) {
      this.players = next;
    }
  }

  changeDifficulty(delta: number): void {
    const len = this.difficulties.length;
    this.difficultyIndex = (this.difficultyIndex + delta + len) % len;
  }

  changeQuestions(delta: number): void {
    const next = this.questions + delta * this.questionsStep;
    if (next >= this.minQuestions && next <= this.maxQuestions) {
      this.questions = next;
    }
  }

  changeCategory(delta: number): void {
    const len = this.categories.length;
    this.categoryIndex = (this.categoryIndex + delta + len) % len;
  }

  // Luego aquí podrás armar el payload para el backend
  onCreateRoom(): void {
    const payload = {
      players: this.players,
      difficulty: this.difficulties[this.difficultyIndex],
      questions: this.questions,
      category: this.categories[this.categoryIndex],
    };
    console.log('Room config:', payload);
    // TODO: llamar al microservicio y navegar a la sala
  }
}
