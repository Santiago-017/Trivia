// src/app/services/session.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Session {
  constructor(private http: HttpClient) {}

  // Crear una sesión nueva (HOST)
  create(dto: {
    players: number;
    difficulty: string;
    questions: number;
    category: string;
  }): Observable<any> {
    // POST http://IP:3000/sessions
    return this.http.post(`${environment.wsUrl}/sessions`, dto);
  }

  // (por si lo necesitas) obtener sesión por id
  getById(sessionId: number | string): Observable<any> {
    return this.http.get(`${environment.wsUrl}/sessions/${sessionId}`);
  }

  // 🔹 NUEVO: unirse a una sesión usando el gameCode
  joinByCode(
    gameCode: string,
    nickname: string,
    userId?: number
  ): Observable<any> {
    const body: any = { gameCode, nickname };
    if (userId != null) {
      body.userId = userId;
    }

    // POST /sessions/join-by-code
    return this.http.post(`${environment.wsUrl}/sessions/join-by-code`, body);
  }

  // Iniciar la sesión (HOST)
  start(sessionId: number | string): Observable<any> {
    // POST http://IP:3000/sessions/:id/start
    console.log('Starting session with ID:', sessionId);
    return this.http.post(
      `${environment.wsUrl}/sessions/${sessionId}/start`,
      {}
    );
  }

  // Pedir la siguiente pregunta (se usa el sessionId INTERNO)
  nextQuestion(
    sessionId: number | string,
    currentQuestionOrder: number
  ): Observable<any> {
    // GET http://IP:3000/sessions/:id/next-question/:currentQuestionOrder
    console.log(
      'Fetching next question. session:',
      sessionId,
      'current order:',
      currentQuestionOrder
    );
    return this.http.get(
      `${environment.wsUrl}/sessions/${sessionId}/next-question/${currentQuestionOrder}`
    );
  }
}
