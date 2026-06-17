import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <!-- Left panel: branding -->
      <div class="auth-brand">
        <div class="brand-inner">
          <div class="brand-logo">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <h1 class="brand-name">TaskMaster</h1>
          <p class="brand-tagline">Your work, beautifully organized.</p>
          <ul class="brand-features">
            <li><span class="material-symbols-outlined">check_circle</span> Smart task prioritization</li>
            <li><span class="material-symbols-outlined">check_circle</span> Due dates & categories</li>
            <li><span class="material-symbols-outlined">check_circle</span> Secure personal workspace</li>
          </ul>
        </div>
      </div>

      <!-- Right panel: form -->
      <div class="auth-form-panel">
        <div class="auth-card">
          <div class="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your workspace</p>
          </div>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
            <div class="field">
              <label for="email">Email address</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  [(ngModel)]="credentials.email"
                  placeholder="you@example.com"
                  required
                  autocomplete="email"
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
                  [(ngModel)]="credentials.password"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
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

            <button type="submit" class="btn-submit" [disabled]="!loginForm.valid || loading">
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading" class="loading-dots">Signing in<span>...</span></span>
            </button>
          </form>

          <p class="switch-link">
            Don't have an account?
            <a routerLink="/register">Create one free</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  credentials = { email: '', password: '' };
  loading = false;
  error = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
