import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Session } from '../../services/session';

type Mode = 'vs' | 'coop';

interface PlayerScore {
  userId?: number;
  name: string;
  score: number;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scoreboard.html',
  styleUrls: ['./scoreboard.scss'],
})
export class Scoreboard implements OnInit {
  mode: Mode = 'vs';
  teamScore = 0;
  teamStreak = 0;

  players: PlayerScore[] = [];

  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private sessionService: Session) {}

  ngOnInit(): void {
    const gameCode = (this.route.snapshot.paramMap.get('game_code') || '').trim();
    if (!gameCode) {
      this.loading = false;
      this.error = 'No hay gameCode en la URL.';
      return;
    }

    this.sessionService.getScoreboard(gameCode).subscribe({
      next: (res: any) => {
        this.loading = false;

        const m = String(res?.mode || 'vs').toLowerCase();
        this.mode = (m === 'coop' ? 'coop' : 'vs');

        this.teamScore = Number(res?.teamScore ?? 0);
        this.teamStreak = Number(res?.teamStreak ?? 0);

        const rows = Array.isArray(res?.players) ? res.players : [];
        this.players = rows.map((p: any) => ({
          userId: Number(p.userId),
          name: p.nickname || p.name || `Jugador ${p.userId}`,
          score: Number(p.score ?? 0),
        }));

        this.players.sort((a, b) => b.score - a.score);

        // ✅ DEBUG útil (borra luego)
        console.log('Scoreboard → mode:', this.mode, 'teamScore:', this.teamScore);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.error = 'No se pudo cargar el scoreboard.';
      },
    });
  }
}
