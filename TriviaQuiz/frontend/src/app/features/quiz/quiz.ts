// src/app/features/quiz/quiz.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.scss'],
})
export class Quiz {
  question = 'WHAT IS THE LARGEST MAMMAL IN THE WORLD?';

  options = ['ELEPHANT', 'LION', 'TIGER', 'BLUE WHALE'];

  selectedIndex: number | null = null;

  // Por ahora solo marcamos la respuesta seleccionada visualmente
  selectOption(index: number): void {
    this.selectedIndex = index;
  }
}
