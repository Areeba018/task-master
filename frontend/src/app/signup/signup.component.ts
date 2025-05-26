import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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
