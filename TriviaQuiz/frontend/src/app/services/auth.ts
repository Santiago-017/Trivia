// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = `${environment.wsUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(data: { username: string; password: string; email?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        // si el backend responde { token: '...' }
        if (res?.token) {
          localStorage.setItem('token', res.token); // guardar JWT [web:49][web:153]
        }
        const userId = res?.user?.id;
        localStorage.setItem('userId', userId);
        console.log('Storing userId in localStorage:', userId);
        const username = res?.user?.username;
        localStorage.setItem('username', username);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
    isLogged(): boolean {
    return !!localStorage.getItem('token');
  }
}
