import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, Priority } from '../../services/task.service';
import { debounceTime, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">My Tasks</h1>
        <p class="page-subtitle">Manage your daily workflow and priorities</p>
      </div>
      <button class="btn-primary" (click)="showCreateModal = true">
        <span class="material-symbols-outlined">add</span>
        New Task
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pending"><span class="material-symbols-outlined">assignment_late</span></div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed"><span class="material-symbols-outlined">task_alt</span></div>
        <div class="stat-info">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="filters-bar glass">
      <div class="search-box">
        <span class="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search tasks..." [(ngModel)]="filters.search" (ngModelChange)="onSearchChange()">
      </div>
      
      <select [(ngModel)]="filters.priority" (change)="loadTasks()">
        <option value="">All Priorities</option>
        <option [value]="Priority.LOW">Low</option>
        <option [value]="Priority.MEDIUM">Medium</option>
        <option [value]="Priority.HIGH">High</option>
      </select>

      <select [(ngModel)]="filters.completed" (change)="loadTasks()">
        <option value="">All Status</option>
        <option [value]="false">Pending</option>
        <option [value]="true">Completed</option>
      </select>
    </div>

    <!-- Task List -->
    <div class="task-list">
      <div *ngFor="let task of tasks" class="task-card" [class.completed]="task.completed">
        <div class="task-check" (click)="toggleTask(task)">
          <span class="material-symbols-outlined">{{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}</span>
        </div>
        
        <div class="task-content">
          <div class="task-main">
            <h3 class="task-title">{{ task.title }}</h3>
            <p class="task-desc">{{ task.description }}</p>
          </div>
          
          <div class="task-meta">
            <span class="badge" [class]="'badge-' + task.priority.toLowerCase()">{{ task.priority }}</span>
            <span class="meta-item" *ngIf="task.category">
              <span class="material-symbols-outlined">label</span>
              {{ task.category }}
            </span>
            <span class="meta-item" *ngIf="task.dueDate">
              <span class="material-symbols-outlined">calendar_today</span>
              {{ task.dueDate | date:'mediumDate' }}
            </span>
          </div>
        </div>

        <div class="task-actions">
          <button (click)="deleteTask(task)" class="icon-btn delete"><span class="material-symbols-outlined">delete</span></button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="tasks.length === 0" class="empty-state">
        <span class="material-symbols-outlined big-icon">inventory_2</span>
        <h3>No tasks found</h3>
        <p>Try adjusting your filters or create a new task.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" *ngIf="totalPages > 1">
      <button [disabled]="filters.page === 0" (click)="goToPage(filters.page - 1)">Previous</button>
      <span>Page {{ filters.page + 1 }} of {{ totalPages }}</span>
      <button [disabled]="filters.page === totalPages - 1" (click)="goToPage(filters.page + 1)">Next</button>
    </div>

    <!-- Create Modal (Simplified for now) -->
    <div class="modal-backdrop" *ngIf="showCreateModal">
      <div class="modal glass">
        <h2>Create New Task</h2>
        <form (ngSubmit)="createTask()">
          <div class="form-group">
            <label>Title</label>
            <input name="title" [(ngModel)]="newTask.title" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="desc" [(ngModel)]="newTask.description"></textarea>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Priority</label>
              <select name="priority" [(ngModel)]="newTask.priority">
                <option [value]="Priority.LOW">Low</option>
                <option [value]="Priority.MEDIUM">Medium</option>
                <option [value]="Priority.HIGH">High</option>
              </select>
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" name="dueDate" [(ngModel)]="newTask.dueDate">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" (click)="showCreateModal = false">Cancel</button>
            <button type="submit" class="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 700; color: var(--text-main); }
    .page-subtitle { color: var(--text-muted); margin-top: 0.25rem; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: var(--radius); display: flex; align-items: center; gap: 1rem; box-shadow: var(--shadow); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.pending { background: #fee2e2; color: #ef4444; }
    .stat-icon.completed { background: #dcfce7; color: #10b981; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); }

    .filters-bar { padding: 1.25rem; border-radius: var(--radius); display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
    .search-box { flex: 1; position: relative; }
    .search-box .material-symbols-outlined { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .search-box input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white; }
    select { padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white; }

    .task-list { display: flex; flex-direction: column; gap: 1rem; }
    .task-card { background: white; padding: 1.25rem; border-radius: var(--radius); display: flex; align-items: center; gap: 1.25rem; box-shadow: var(--shadow); transition: all 0.2s; }
    .task-card:hover { transform: translateX(5px); }
    .task-card.completed { opacity: 0.7; }
    .task-card.completed .task-title { text-decoration: line-through; color: var(--text-muted); }
    .task-check { cursor: pointer; color: var(--text-muted); }
    .task-card.completed .task-check { color: var(--success); }
    .task-content { flex: 1; }
    .task-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem; }
    .task-desc { color: var(--text-muted); font-size: 0.9rem; }
    .task-meta { display: flex; gap: 1rem; margin-top: 0.75rem; align-items: center; }
    .meta-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; color: var(--text-muted); }
    .meta-item .material-symbols-outlined { font-size: 1rem; }
    .task-actions { display: flex; gap: 0.5rem; }
    .icon-btn.delete:hover { color: var(--danger); background: #fee2e2; }

    .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
    .big-icon { font-size: 4rem; color: var(--border); margin-bottom: 1rem; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-top: 2rem; color: var(--text-muted); }
    .pagination button { padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white; }
    .pagination button:disabled { opacity: 0.5; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal { background: white; padding: 2rem; border-radius: 1.5rem; width: 100%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
    textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; height: 100px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
  `]
})
export class TasksPage implements OnInit {
  tasks: Task[] = [];
  pendingCount = 0;
  completedCount = 0;
  totalPages = 0;
  showCreateModal = false;
  Priority = Priority;

  filters = {
    search: '',
    priority: '',
    completed: '' as any,
    page: 0,
    size: 10
  };

  newTask: Task = this.resetNewTask();

  private searchSubject = new Subject<string>();

  constructor(private taskService: TaskService) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => this.loadTasks());
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.filters).subscribe(page => {
      this.tasks = page.content;
      this.totalPages = page.totalPages;
      this.updateStats();
    });
  }

  updateStats(): void {
    // Ideally these would come from the backend or be separate calls, 
    // but for now, we'll just count what's in the current view or do a separate call.
    this.taskService.getTasks({ size: 1000 }).subscribe(all => {
      this.pendingCount = all.content.filter(t => !t.completed).length;
      this.completedCount = all.content.filter(t => t.completed).length;
    });
  }

  onSearchChange(): void {
    this.filters.page = 0;
    this.searchSubject.next(this.filters.search);
  }

  goToPage(page: number): void {
    this.filters.page = page;
    this.loadTasks();
  }

  toggleTask(task: Task): void {
    if (!task.id) return;
    this.taskService.toggleTask(task.id).subscribe(() => this.loadTasks());
  }

  deleteTask(task: Task): void {
    if (!task.id) return;
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe(() => this.loadTasks());
    }
  }

  createTask(): void {
    if (this.newTask.dueDate) {
      this.newTask.dueDate = new Date(this.newTask.dueDate).toISOString();
    }
    this.taskService.createTask(this.newTask).subscribe(() => {
      this.showCreateModal = false;
      this.newTask = this.resetNewTask();
      this.loadTasks();
    });
  }

  private resetNewTask(): Task {
    return { title: '', description: '', completed: false, priority: Priority.MEDIUM };
  }
}
