import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  template: `
    <div class="login-container" [class.dark-theme]="themeService.isDark$ | async">
      <div class="login-card">
        <h1>Welcome Back</h1>
        <p class="subtitle">Login to manage your tasks</p>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="form-control"
              [class.error]="isFieldInvalid('username')"
              placeholder="Enter username"
            />
            <div class="error-text" *ngIf="isFieldInvalid('username')">
              {{ getErrorMessage('username') }}
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.error]="isFieldInvalid('password')"
              placeholder="Enter password"
            />
            <div class="error-text" *ngIf="isFieldInvalid('password')">
              {{ getErrorMessage('password') }}
            </div>
          </div>

          <button 
            type="submit" 
            class="submit-button"
            [disabled]="loginForm.invalid || isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="signup-link">
          Don't have an account? <a routerLink="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-card {
      background: #ffffff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    .dark-theme .login-card {
      background: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    h1 {
      margin: 0 0 0.5rem;
      color: #2d3748;
      font-size: 1.8rem;
      font-weight: 600;
      text-align: center;
    }

    .dark-theme h1 {
      color: #2d3748;
    }

    .subtitle {
      color: #4a5568;
      text-align: center;
      margin-bottom: 2rem;
    }

    .dark-theme .subtitle {
      color: #4a5568;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }

    .dark-theme label {
      color: #4a5568;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: #ffffff;
      color: #2d3748;
      transition: border-color 0.2s;
    }

    .dark-theme .form-control {
      background: #ffffff;
      color: #2d3748;
      border-color: #e2e8f0;
    }

    .form-control:focus {
      outline: none;
      border-color: #4299e1;
    }

    .form-control.error {
      border-color: #fc8181;
    }

    .error-text {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .dark-theme .error-text {
      color: #e53e3e;
    }

    .submit-button {
      width: 100%;
      padding: 0.75rem;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .submit-button:hover:not(:disabled) {
      background: #3182ce;
    }

    .submit-button:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }

    .signup-link {
      margin-top: 1.5rem;
      text-align: center;
      color: #4a5568;
    }

    .dark-theme .signup-link {
      color: #4a5568;
    }

    .signup-link a {
      color: #4299e1;
      text-decoration: none;
      font-weight: 500;
    }

    .dark-theme .signup-link a {
      color: #4299e1;
    }

    .signup-link a:hover {
      text-decoration: underline;
    }

    .error-message {
      background: #fff5f5;
      color: #c53030;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .dark-theme .error-message {
      background: #fff5f5;
      color: #c53030;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Reset form and error when component initializes
    this.loginForm.reset();
    this.error = null;
  }

  isFieldInvalid(field: string): boolean {
    const formField = this.loginForm.get(field);
    return !!formField && formField.invalid && (formField.dirty || formField.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;

      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.error = error.message || 'Failed to login. Please try again.';
          this.loginForm.patchValue({ password: '' });
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }
} 