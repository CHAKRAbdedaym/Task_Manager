import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <!-- Left branding panel -->
      <div class="auth-brand">
        <div class="brand-inner">
          <div class="brand-logo">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <h1 class="brand-name">TaskMaster</h1>
          <p class="brand-tagline">Join thousands who get more done.</p>
          <div class="brand-card">
            <div class="steps">
              <div class="step">
                <div class="step-num">1</div>
                <div>
                  <strong>Create your account</strong>
                  <p>Free in seconds</p>
                </div>
              </div>
              <div class="step">
                <div class="step-num">2</div>
                <div>
                  <strong>Add your tasks</strong>
                  <p>With priorities & due dates</p>
                </div>
              </div>
              <div class="step">
                <div class="step-num">3</div>
                <div>
                  <strong>Stay organized</strong>
                  <p>Crush your goals daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="auth-form-panel">
        <div class="auth-card" *ngIf="!success">
          <div class="auth-card-header">
            <h2>Create your account</h2>
            <p>Get organized — it's free</p>
          </div>

          <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
            <div class="field">
              <label for="displayName">Your name</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">person</span>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  [(ngModel)]="user.displayName"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label for="email">Email address</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  [(ngModel)]="user.email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">lock</span>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  id="password"
                  name="password"
                  [(ngModel)]="user.password"
                  placeholder="At least 6 characters"
                  required
                  minlength="6"
                />
                <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                  <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="error-box" *ngIf="error">
              <span class="material-symbols-outlined">error</span>
              {{ error }}
            </div>

            <button type="submit" class="btn-submit" [disabled]="!registerForm.valid || loading">
              <span *ngIf="!loading">Create Account</span>
              <span *ngIf="loading">Creating account...</span>
            </button>
          </form>

          <p class="switch-link">
            Already have an account?
            <a routerLink="/login">Sign in</a>
          </p>
        </div>

        <!-- Success state -->
        <div class="auth-card success-card" *ngIf="success">
          <div class="success-icon">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <h2>Account created!</h2>
          <p>You're all set. Sign in to start managing your tasks.</p>
          <a routerLink="/login" class="btn-submit" style="display:block; text-align:center; text-decoration:none; margin-top:1.5rem;">
            Go to Sign In
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./register.page.css']
})
export class RegisterPage {
  user = { email: '', password: '', displayName: '' };
  loading = false;
  error = '';
  success = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.authService.register(this.user).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
