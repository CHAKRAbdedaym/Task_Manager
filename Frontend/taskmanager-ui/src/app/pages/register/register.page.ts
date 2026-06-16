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
    <div class="auth-container">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p>Join us to get your tasks organized</p>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="displayName">Display Name</label>
            <input type="text" id="displayName" name="displayName" [(ngModel)]="user.displayName" required>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" [(ngModel)]="user.email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="user.password" required minlength="6">
          </div>
          
          <div *ngIf="error" class="error-message">{{ error }}</div>
          
          <button type="submit" [disabled]="!registerForm.valid || loading">
            {{ loading ? 'Creating account...' : 'Register' }}
          </button>
        </form>
        
        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
    }
    .auth-card {
      background: white;
      padding: 2.5rem;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 { margin-bottom: 0.5rem; color: #333; font-size: 1.8rem; }
    p { color: #666; margin-bottom: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: #444; font-weight: 500; }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: #0072ff; }
    button {
      width: 100%;
      padding: 0.85rem;
      background: #0072ff;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover:not(:disabled) { background: #0056b3; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .error-message { color: #e53e3e; margin-bottom: 1rem; font-size: 0.9rem; }
    .auth-footer { margin-top: 1.5rem; text-align: center; color: #666; font-size: 0.9rem; }
    a { color: #0072ff; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  `]
})
export class RegisterPage {
  user = { email: '', password: '', displayName: '' };
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.authService.register(this.user).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { registered: true } }),
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
