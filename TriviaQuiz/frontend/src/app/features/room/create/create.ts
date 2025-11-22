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
export class Create {}
