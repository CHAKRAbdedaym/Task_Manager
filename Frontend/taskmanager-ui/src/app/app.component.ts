import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppShellComponent } from './core/components/app-shell.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, AppShellComponent],
  template: `
    <ng-container *ngIf="authService.user$ | async; else auth">
      <app-shell>
        <router-outlet></router-outlet>
      </app-shell>
    </ng-container>
    
    <ng-template #auth>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}