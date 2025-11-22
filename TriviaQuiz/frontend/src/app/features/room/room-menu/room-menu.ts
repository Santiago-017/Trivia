import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-room-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './room-menu.html',
  styleUrls: ['./room-menu.scss'],
})
export class RoomMenu {}
