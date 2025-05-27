import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="signup-container" [class.dark-theme]="themeService.isDark$ | async">
      <div class="signup-card">
        <h1>Create Account</h1>
        <p class="subtitle">Join TaskMaster to start managing your tasks</p>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
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
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.error]="isFieldInvalid('email')"
              placeholder="Enter email"
            />
            <div class="error-text" *ngIf="isFieldInvalid('email')">
              {{ getErrorMessage('email') }}
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
            [disabled]="signupForm.invalid || isLoading"
          >
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="login-link">
          Already have an account? <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .signup-card {
      background: #ffffff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    .dark-theme .signup-card {
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

    .login-link {
      margin-top: 1.5rem;
      text-align: center;
      color: #4a5568;
    }

    .dark-theme .login-link {
      color: #4a5568;
    }

    .login-link a {
      color: #4299e1;
      text-decoration: none;
      font-weight: 500;
    }

    .dark-theme .login-link a {
      color: #4299e1;
    }

    .login-link a:hover {
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

    .success-message {
      background: #f0fff4;
      color: #276749;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .dark-theme .success-message {
      background: #f0fff4;
      color: #276749;
    }
  `]
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Reset form and messages when component initializes
    this.signupForm.reset();
    this.error = null;
    this.successMessage = null;
  }

  isFieldInvalid(field: string): boolean {
    const formField = this.signupForm.get(field);
    return !!formField && formField.invalid && (formField.dirty || formField.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.signupForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${minLength} characters`;
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      this.authService.signup(this.signupForm.value).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Redirecting to login...';
          this.signupForm.reset();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error) => {
          console.error('Signup error:', error);
          this.isLoading = false;
          this.error = error.message || 'Failed to create account. Please try again.';
          // Only clear password on error
          this.signupForm.patchValue({ password: '' });
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }
}
