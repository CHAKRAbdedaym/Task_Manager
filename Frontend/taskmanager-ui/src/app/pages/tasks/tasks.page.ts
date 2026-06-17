import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, Priority } from '../../services/task.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">My Tasks</h1>
        <p class="page-subtitle">Manage your daily workflow and priorities</p>
      </div>
      <button class="btn-primary" (click)="openCreateModal()">
        <span class="material-symbols-outlined">add</span>
        New Task
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pending">
          <span class="material-symbols-outlined">assignment_late</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon done">
          <span class="material-symbols-outlined">task_alt</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <span class="material-symbols-outlined">list_alt</span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalElements }}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="filters-bar">
      <div class="search-box">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          type="text"
          class="search-input"
          placeholder="Search tasks..."
          [(ngModel)]="filters.search"
          (ngModelChange)="onSearchChange()"
        />
      </div>
      <div class="filter-controls">
        <select class="filter-select" [(ngModel)]="filters.priority" (change)="reload()">
          <option value="">All Priorities</option>
          <option [value]="Priority.LOW">🟢 Low</option>
          <option [value]="Priority.MEDIUM">🟡 Medium</option>
          <option [value]="Priority.HIGH">🔴 High</option>
        </select>
        <select class="filter-select" [(ngModel)]="filters.completed" (change)="reload()">
          <option value="">All Status</option>
          <option [value]="false">⏳ Pending</option>
          <option [value]="true">✅ Done</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="loading">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div class="error-banner" *ngIf="error && !loading">
      <span class="material-symbols-outlined">error</span>
      <p>{{ error }}</p>
      <button (click)="loadTasks()">Retry</button>
    </div>

    <!-- Task List -->
    <div class="task-list" *ngIf="!loading && !error">

      <!-- Empty State -->
      <div class="empty-state" *ngIf="tasks.length === 0">
        <span class="material-symbols-outlined empty-icon">inventory_2</span>
        <h3>No tasks yet</h3>
        <p>Create your first task to get started!</p>
        <button class="btn-primary" (click)="openCreateModal()">
          <span class="material-symbols-outlined">add</span>
          New Task
        </button>
      </div>

      <!-- Task Cards -->
      <div
        *ngFor="let task of tasks; trackBy: trackById"
        class="task-card"
        [class.task-completed]="task.completed"
      >
        <div class="task-check" (click)="toggleTask(task)" [title]="task.completed ? 'Mark Pending' : 'Mark Done'">
          <span class="material-symbols-outlined">
            {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
        </div>

        <div class="task-body">
          <div class="task-header-row">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-badges">
              <span class="badge" [ngClass]="'badge-' + task.priority.toLowerCase()">
                {{ task.priority }}
              </span>
            </div>
          </div>
          <p class="task-desc" *ngIf="task.description">{{ task.description }}</p>
          <div class="task-meta">
            <span class="meta-chip" *ngIf="task.category">
              <span class="material-symbols-outlined">label</span>
              {{ task.category }}
            </span>
            <span class="meta-chip" *ngIf="task.dueDate" [class.overdue]="isOverdue(task)">
              <span class="material-symbols-outlined">calendar_today</span>
              {{ task.dueDate | date:'MMM d, y' }}
            </span>
          </div>
        </div>

        <div class="task-actions">
          <button class="icon-btn edit-btn" (click)="openEditModal(task)" title="Edit">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="icon-btn delete-btn" (click)="deleteTask(task)" title="Delete">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" *ngIf="totalPages > 1 && !loading">
      <button class="page-btn" [disabled]="filters.page === 0" (click)="goToPage(filters.page - 1)">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <span class="page-info">Page {{ filters.page + 1 }} of {{ totalPages }}</span>
      <button class="page-btn" [disabled]="filters.page === totalPages - 1" (click)="goToPage(filters.page + 1)">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>

    <!-- Create / Edit Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
      <div class="modal-box">
        <div class="modal-header">
          <h2>{{ editingTask ? 'Edit Task' : 'New Task' }}</h2>
          <button class="icon-btn" (click)="showModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form (ngSubmit)="submitTask()">
          <div class="form-group">
            <label>Title <span class="required">*</span></label>
            <input class="form-input" name="title" [(ngModel)]="formTask.title" required placeholder="What needs to be done?" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-input" name="desc" [(ngModel)]="formTask.description" placeholder="Add details..." rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Priority</label>
              <select class="form-input" name="priority" [(ngModel)]="formTask.priority">
                <option [value]="Priority.LOW">Low</option>
                <option [value]="Priority.MEDIUM">Medium</option>
                <option [value]="Priority.HIGH">High</option>
              </select>
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input class="form-input" type="date" name="dueDate" [(ngModel)]="formTask.dueDate" />
            </div>
          </div>
          <div class="form-group">
            <label>Category</label>
            <input class="form-input" name="category" [(ngModel)]="formTask.category" placeholder="e.g. Work, Personal" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="!formTask.title.trim()">
              {{ editingTask ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./tasks.page.css']
})
export class TasksPage implements OnInit, OnDestroy {
  tasks: Task[] = [];
  loading = false;
  error: string | null = null;
  pendingCount = 0;
  completedCount = 0;
  totalElements = 0;
  totalPages = 0;
  showModal = false;
  editingTask: Task | null = null;
  Priority = Priority;

  filters: any = {
    search: '',
    priority: '',
    completed: '',
    page: 0,
    size: 10,
    sort: 'createdAt,desc'
  };

  formTask: any = this.emptyForm();

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private taskService: TaskService) {
    this.searchSubject.pipe(
      debounceTime(350),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadTasks());
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;
    this.taskService.getTasks(this.filters).subscribe({
      next: (page) => {
        this.tasks = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.pendingCount = page.content.filter(t => !t.completed).length;
        this.completedCount = page.content.filter(t => t.completed).length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  reload(): void {
    this.filters.page = 0;
    this.loadTasks();
  }

  onSearchChange(): void {
    this.filters.page = 0;
    this.searchSubject.next(this.filters.search);
  }

  goToPage(page: number): void {
    this.filters.page = page;
    this.loadTasks();
  }

  openCreateModal(): void {
    this.editingTask = null;
    this.formTask = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.editingTask = task;
    this.formTask = {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      category: task.category ?? '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : ''
    };
    this.showModal = true;
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showModal = false;
    }
  }

  submitTask(): void {
    if (!this.formTask.title.trim()) return;

    const payload: Task = {
      title: this.formTask.title.trim(),
      description: this.formTask.description?.trim() || '',
      completed: false,
      priority: this.formTask.priority as Priority,
      category: this.formTask.category?.trim() || undefined,
      dueDate: this.formTask.dueDate ? new Date(this.formTask.dueDate).toISOString() : undefined
    };

    if (this.editingTask?.id) {
      this.taskService.updateTask(this.editingTask.id, payload).subscribe({
        next: () => { this.showModal = false; this.loadTasks(); },
        error: (err) => console.error('Update failed:', err)
      });
    } else {
      this.taskService.createTask(payload).subscribe({
        next: () => { this.showModal = false; this.loadTasks(); },
        error: (err) => console.error('Create failed:', err)
      });
    }
  }

  toggleTask(task: Task): void {
    if (!task.id) return;
    this.taskService.toggleTask(task.id).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Toggle failed:', err)
    });
  }

  deleteTask(task: Task): void {
    if (!task.id) return;
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Delete failed:', err)
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }

  trackById(_: number, task: Task): number {
    return task.id!;
  }

  private emptyForm() {
    return { title: '', description: '', priority: Priority.MEDIUM, category: '', dueDate: '' };
  }
}
