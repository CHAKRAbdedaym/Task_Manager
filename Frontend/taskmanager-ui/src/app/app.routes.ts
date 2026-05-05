import { Routes } from '@angular/router';
import { TasksPage } from './pages/tasks/tasks.page';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'tasks', component: TasksPage },
  { path: '**', redirectTo: 'tasks' }
];
