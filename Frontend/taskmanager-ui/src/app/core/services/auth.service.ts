import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  email: string;
  displayName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: any): Observable<any> {
    return this.http.post('/api/auth/register', payload);
  }

  login(payload: any): Observable<User> {
    return this.http.post<User>('/api/auth/login', payload).pipe(
      tap(user => {
        this.saveUserToStorage(user);
        this.userSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.userSubject.value?.token ?? null;
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem('auth_user');
    return data ? JSON.parse(data) : null;
  }
}
