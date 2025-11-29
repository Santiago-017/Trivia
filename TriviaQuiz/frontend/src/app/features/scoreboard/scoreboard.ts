// src/app/features/scoreboard/scoreboard.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlayerScore {
  name: string;
  score: number;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.html',
  styleUrls: ['./scoreboard.scss'],
})
export class Scoreboard {
  // Más adelante esto vendrá del backend
  players: PlayerScore[] = [
    { name: 'PLAYER 1', score: 980 },
    { name: 'PLAYER 2', score: 790 },
    { name: 'PLAYER 3', score: 920 },
    { name: 'PLAYER 4', score: 540 },
    { name: 'PLAYER 5', score: 780 },
  ];
}
