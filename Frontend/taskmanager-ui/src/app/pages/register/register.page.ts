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
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

    .auth-page { display: flex; height: 100vh; font-family: 'Inter', sans-serif; }

    .auth-brand {
      flex: 1;
      background: linear-gradient(145deg, #0ea5e9 0%, #6366f1 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 3rem; color: white;
    }
    @media (max-width: 768px) { .auth-brand { display: none; } }

    .brand-inner { max-width: 380px; }
    .brand-logo {
      width: 64px; height: 64px;
      background: rgba(255,255,255,0.15);
      border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem;
    }
    .brand-logo .material-symbols-outlined { font-size: 2rem; }
    .brand-name { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    .brand-tagline { opacity: 0.8; margin-bottom: 2.5rem; }

    .brand-card {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 1rem;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }
    .steps { display: flex; flex-direction: column; gap: 1.25rem; }
    .step { display: flex; align-items: flex-start; gap: 1rem; }
    .step-num {
      width: 30px; height: 30px;
      background: rgba(255,255,255,0.9);
      color: #6366f1; font-weight: 800;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 0.85rem;
    }
    .step strong { display: block; font-weight: 600; }
    .step p { font-size: 0.85rem; opacity: 0.75; margin-top: 0.1rem; }

    .auth-form-panel {
      width: 480px;
      display: flex; align-items: center; justify-content: center;
      background: #f8fafc; padding: 2rem;
    }
    @media (max-width: 768px) { .auth-form-panel { width: 100%; } }

    .auth-card {
      background: white; border-radius: 1.5rem;
      padding: 2.5rem; width: 100%; max-width: 400px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }

    .auth-card-header { margin-bottom: 2rem; }
    .auth-card-header h2 { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
    .auth-card-header p { color: #64748b; margin-top: 0.25rem; }

    .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-size: 0.85rem; font-weight: 600; color: #374151; }

    .input-wrapper { position: relative; display: flex; align-items: center; }
    .input-icon {
      position: absolute; left: 0.85rem;
      color: #94a3b8; font-size: 1.15rem; pointer-events: none;
    }
    .input-wrapper input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 0.75rem;
      background: #f8fafc;
      font-size: 0.95rem; color: #0f172a;
      transition: all 0.2s;
    }
    .input-wrapper input:focus {
      outline: none; border-color: #6366f1; background: white;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    }
    .toggle-pw {
      position: absolute; right: 0.75rem;
      background: none; border: none;
      color: #94a3b8; cursor: pointer; display: flex; align-items: center;
    }
    .toggle-pw:hover { color: #6366f1; }

    .error-box {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 0.75rem; color: #dc2626; font-size: 0.88rem;
    }
    .error-box .material-symbols-outlined { font-size: 1rem; flex-shrink: 0; }

    .btn-submit {
      width: 100%; padding: 0.85rem;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: white; border: none; border-radius: 0.75rem;
      font-weight: 700; font-size: 1rem; cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(99,102,241,0.3);
      margin-top: 0.25rem;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.4); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .switch-link { text-align: center; margin-top: 1.5rem; color: #64748b; font-size: 0.9rem; }
    .switch-link a { color: #6366f1; font-weight: 600; text-decoration: none; }
    .switch-link a:hover { text-decoration: underline; }

    .success-card { text-align: center; }
    .success-icon .material-symbols-outlined { font-size: 4rem; color: #059669; }
    .success-card h2 { margin-top: 1rem; font-size: 1.5rem; }
    .success-card p { color: #64748b; margin-top: 0.5rem; }
  `]
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
