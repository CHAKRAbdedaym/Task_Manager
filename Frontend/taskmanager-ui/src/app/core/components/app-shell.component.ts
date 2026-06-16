import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell-container">
      <aside class="sidebar" [class.collapsed]="collapsed">
        <div class="brand">
          <span class="material-symbols-outlined logo">task_alt</span>
          <span class="brand-name" *ngIf="!collapsed">TaskMaster</span>
        </div>
        
        <nav class="nav-links">
          <a routerLink="/tasks" routerLinkActive="active" class="nav-item">
            <span class="material-symbols-outlined">dashboard</span>
            <span class="nav-label" *ngIf="!collapsed">Dashboard</span>
          </a>
          <!-- Future links: Calendar, Categories, etc. -->
        </nav>

        <div class="sidebar-spacer"></div>

        <div class="user-profile" *ngIf="!collapsed">
          <div class="avatar">{{ userInitial }}</div>
          <div class="user-info">
            <div class="user-name">{{ (authService.user$ | async)?.displayName }}</div>
            <div class="user-email">{{ (authService.user$ | async)?.email }}</div>
          </div>
        </div>

        <button (click)="logout()" class="nav-item logout-btn">
          <span class="material-symbols-outlined">logout</span>
          <span class="nav-label" *ngIf="!collapsed">Sign Out</span>
        </button>
      </aside>

      <main class="main-content">
        <header class="top-nav">
          <button (click)="collapsed = !collapsed" class="icon-btn">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="spacer"></div>
          <!-- Notifications context etc -->
        </header>
        
        <div class="page-body">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .shell-container { display: flex; height: 100vh; background: var(--bg-main); }
    .sidebar {
      width: 280px;
      padding: 1.5rem;
      background: #1e293b;
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
    }
    .sidebar.collapsed { width: 80px; padding: 1.5rem 0.75rem; }
    .brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 3rem; }
    .logo { font-size: 2.5rem; color: var(--primary); }
    .brand-name { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
    .nav-links { display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border-radius: 0.75rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
    }
    .nav-item:hover, .nav-item.active { background: #334155; color: white; }
    .nav-item.active { color: var(--primary); }
    .sidebar-spacer { flex: 1; }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #334155;
      border-radius: var(--radius);
      margin-bottom: 1rem;
    }
    .avatar {
      width: 36px;
      height: 36px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    .user-info { min-width: 0; }
    .user-name { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-email { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .logout-btn { margin-top: auto; color: #f87171; }
    .logout-btn:hover { background: rgba(248, 113, 113, 0.1); color: #ef4444; }
    
    .main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .top-nav { height: 70px; padding: 0 2rem; display: flex; align-items: center; border-bottom: 1px solid var(--border); background: white; }
    .page-body { padding: 2rem; overflow-y: auto; flex: 1; }
    .icon-btn { background: none; border: none; padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
    .icon-btn:hover { background: var(--bg-main); }
    .spacer { flex: 1; }
  `]
})
export class AppShellComponent {
  collapsed = false;

  constructor(public authService: AuthService) {}

  get userInitial(): string {
    return this.authService.user?.displayName?.[0]?.toUpperCase() ?? '?';
  }

  logout(): void {
    this.authService.logout();
  }
}
