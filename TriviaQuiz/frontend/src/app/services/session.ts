import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Session {
  constructor(private http: HttpClient) {}

  create(dto: {
    players: number;
    difficulty: string;
    questions: number;
    category: string;
  }) {
    // POST http://IP:3000/sessions
    return this.http.post(`${environment.wsUrl}/sessions`, dto);
  }

  join(sessionId: number | string, nickname: string) {
    // POST http://IP:3000/sessions/:id/join
    return this.http.post(`${environment.wsUrl}/sessions/${sessionId}/join`, {
      nickname,
    });
  }
  start(sessionId: number | string) {
    // POST http://IP:3000/sessions/:id/start
    console.log("Starting session with ID:", sessionId);
    return this.http.post(`${environment.wsUrl}/sessions/${sessionId}/start`, {});
  }
  nextQuestion(sessionId: number | string, currentQuestionOrder: number) {
    // GET http://IP:3000/sessions/:id/next-question
    console.log("Fetching pregunta 2:", sessionId, "current order:", currentQuestionOrder);
    return this.http.get(`${environment.wsUrl}/sessions/${sessionId}/next-question`, {
      params: { currentQuestionOrder: currentQuestionOrder.toString() }
    });
  }
}
