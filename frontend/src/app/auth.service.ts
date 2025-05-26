import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Temporarily disable auto-check until login is implemented
    // this.checkAuthStatus();
  }

  private checkAuthStatus() {
    this.http.get<User>(`${this.apiUrl}/user/me`, { withCredentials: true })
      .pipe(
        catchError(() => {
          this.router.navigate(['/login']);
          return of(null);
        })
      )
      .subscribe(user => {
        this.currentUserSubject.next(user);
        if (!user) {
          this.router.navigate(['/login']);
        }
      });
  }

  signup(data: SignupData): Observable<any> {
    console.log('Attempting to sign up with data:', data);
    return this.http.post(`${this.apiUrl}/auth/signup`, data, { withCredentials: true })
      .pipe(
        tap(response => {
          console.log('Signup response:', response);
          this.currentUserSubject.next(response as User);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Signup error:', error);
          if (error.status === 409) {
            return throwError(() => new Error('Username or email already exists'));
          }
          return throwError(() => new Error(error.error?.detail || 'Failed to create account. Please try again.'));
        })
      );
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/auth/login`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(() => new Error('Invalid username or password'));
        }
        return throwError(() => new Error('Login failed. Please try again.'));
      })
    );
  }

  logout(): void {
    // Call the backend to logout
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Still clear the local state and redirect even if the server call fails
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }
      });
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
} 