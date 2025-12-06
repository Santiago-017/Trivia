// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Cambia la URL por la de tu backend
    this.socket = io('http://localhost:3000', {
      // si usas JWT en headers/cookies, puedes ajustar opciones aquí
      withCredentials: true
    });
  }

  // === EMITIR EVENTOS ===

  joinSession(sessionId: number, userId: number, nickname: string) {
    this.socket.emit('joinSession', { sessionId, userId, nickname });
  }

  startSession(sessionId: number) {
    this.socket.emit('startSession', { sessionId });
  }

  sendAnswer(payload: {
    sessionId: number;
    sessionQuestionId: number;
    userId: number;
    givenAnswer: string;
    responseTimeMs: number;
  }) {
    this.socket.emit('answer', payload);
  }

  // === ESCUCHAR EVENTOS DEL SERVIDOR ===

  onSessionStarted(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('sessionStarted', (data) => subscriber.next(data));
    });
  }

  onNewQuestion(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('newQuestion', (data) => subscriber.next(data));
    });
  }

  onPlayerAnswered(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('playerAnswered', (data) => subscriber.next(data));
    });
  }

  // opcional
  disconnect() {
    this.socket.disconnect();
  }
}
