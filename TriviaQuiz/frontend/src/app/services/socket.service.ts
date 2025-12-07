// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Usa la misma URL del backend (puedes dejar localhost si quieres)
    this.socket = io(environment.wsUrl, {
      withCredentials: true
    });
  }

  // 🔹 Unirse a la sala usando el gameCode
  joinSession(gameCode: string, userId: number | string, nickname: string) {
    this.socket.emit('joinSession', { gameCode, userId, nickname });
  }

  // 🔹 El host anuncia que comienza la partida
  startSession(gameCode: string) {
    this.socket.emit('startSession', { gameCode });
  }

  // 🔹 El host manda la nueva pregunta al resto
  sendNextQuestion(gameCode: string, question: any) {
    this.socket.emit('nextQuestion', { gameCode, question });
  }

  // 🔹 Un jugador envía su respuesta
  sendAnswer(gameCode: string, payload: any) {
    this.socket.emit('answer', { gameCode, ...payload });
  }

  // Escuchar inicio de partida
  onSessionStarted(): Observable<any> {
    return new Observable((subscriber) => {
      const handler = (data: any) => subscriber.next(data);
      this.socket.on('sessionStarted', handler);
      return () => this.socket.off('sessionStarted', handler);
    });
  }

  // Escuchar nueva pregunta
  onNewQuestion(): Observable<any> {
    return new Observable((subscriber) => {
      const handler = (question: any) => subscriber.next(question);
      this.socket.on('newQuestion', handler);
      return () => this.socket.off('newQuestion', handler);
    });
  }

  // Escuchar cuando entra un jugador
  onPlayerJoined(): Observable<any> {
    return new Observable((subscriber) => {
      const handler = (data: any) => subscriber.next(data);
      this.socket.on('playerJoined', handler);
      return () => this.socket.off('playerJoined', handler);
    });
  }

  // Escuchar respuestas de jugadores (para scoreboard en tiempo real)
  onPlayerAnswered(): Observable<any> {
    return new Observable((subscriber) => {
      const handler = (data: any) => subscriber.next(data);
      this.socket.on('playerAnswered', handler);
      return () => this.socket.off('playerAnswered', handler);
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
