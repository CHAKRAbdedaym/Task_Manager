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
  styles: [`
    :host { display: block; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .page-title { font-size: 2rem; font-weight: 700; color: var(--text-main); }
    .page-subtitle { color: var(--text-muted); margin-top: 0.25rem; font-size: 0.95rem; }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon .material-symbols-outlined { font-size: 1.4rem; }
    .stat-icon.pending { background: #fef3c7; color: #d97706; }
    .stat-icon.done { background: #d1fae5; color: #059669; }
    .stat-icon.total { background: #e0e7ff; color: #4f46e5; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--text-main); line-height: 1; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; font-weight: 500; }

    /* Filters */
    .filters-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-box {
      flex: 1;
      min-width: 200px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 0.9rem;
      color: var(--text-muted);
      font-size: 1.2rem;
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 0.7rem 1rem 0.7rem 2.75rem;
      border: 1.5px solid var(--border);
      border-radius: 0.6rem;
      background: white;
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }
    .search-input:focus { outline: none; border-color: var(--primary); }
    .filter-controls { display: flex; gap: 0.75rem; }
    .filter-select {
      padding: 0.7rem 1rem;
      border: 1.5px solid var(--border);
      border-radius: 0.6rem;
      background: white;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .filter-select:focus { outline: none; border-color: var(--primary); }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      color: var(--text-muted);
      gap: 1rem;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Error */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius);
      padding: 1rem 1.5rem;
      color: #dc2626;
      margin-bottom: 1rem;
    }
    .error-banner button {
      margin-left: auto;
      padding: 0.4rem 1rem;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 0.5rem;
    }

    /* Tasks */
    .task-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .task-card {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      padding: 1.1rem 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .task-card:hover { box-shadow: var(--shadow); transform: translateY(-1px); }
    .task-completed { opacity: 0.6; background: #f8fafc; }
    .task-completed .task-title { text-decoration: line-through; color: var(--text-muted); }

    .task-check {
      cursor: pointer;
      padding-top: 0.1rem;
      flex-shrink: 0;
      color: var(--text-muted);
      transition: color 0.2s;
    }
    .task-check:hover { color: var(--primary); }
    .task-completed .task-check { color: var(--success); }

    .task-body { flex: 1; min-width: 0; }
    .task-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .task-title { font-size: 1rem; font-weight: 600; color: var(--text-main); }
    .task-badges { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .task-desc { font-size: 0.88rem; color: var(--text-muted); margin-top: 0.3rem; line-height: 1.5; }

    .task-meta { display: flex; gap: 0.75rem; margin-top: 0.6rem; flex-wrap: wrap; }
    .meta-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.78rem;
      color: var(--text-muted);
      background: var(--bg-main);
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      border: 1px solid var(--border);
    }
    .meta-chip .material-symbols-outlined { font-size: 0.9rem; }
    .meta-chip.overdue { color: var(--danger); border-color: #fecaca; background: #fef2f2; }

    .task-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .icon-btn {
      background: none;
      border: none;
      padding: 0.4rem;
      border-radius: 0.5rem;
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      transition: all 0.15s;
    }
    .icon-btn .material-symbols-outlined { font-size: 1.15rem; }
    .edit-btn:hover { background: #e0e7ff; color: var(--primary); }
    .delete-btn:hover { background: #fee2e2; color: var(--danger); }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .empty-icon { font-size: 4rem; color: var(--border); margin-bottom: 0.5rem; }
    .empty-state h3 { font-size: 1.25rem; color: var(--text-main); }

    /* Badges */
    .badge { padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
    .badge-low { background: #d1fae5; color: #065f46; }
    .badge-medium { background: #fef3c7; color: #92400e; }
    .badge-high { background: #fee2e2; color: #991b1b; }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    .page-btn {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.4rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      color: var(--text-main);
      transition: all 0.15s;
    }
    .page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 0.9rem; color: var(--text-muted); }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      backdrop-filter: blur(4px);
    }
    .modal-box {
      background: white;
      border-radius: 1.25rem;
      width: 100%;
      max-width: 520px;
      padding: 2rem;
      box-shadow: 0 25px 60px rgba(0,0,0,0.2);
      animation: pop 0.2s ease-out;
    }
    @keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h2 { font-size: 1.3rem; font-weight: 700; }

    .form-group { margin-bottom: 1.1rem; }
    .form-group label { display: block; font-size: 0.88rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.4rem; }
    .required { color: var(--danger); }
    .form-input {
      width: 100%;
      padding: 0.65rem 0.9rem;
      border: 1.5px solid var(--border);
      border-radius: 0.6rem;
      font-size: 0.95rem;
      background: white;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .form-input:focus { outline: none; border-color: var(--primary); }
    textarea.form-input { resize: vertical; min-height: 80px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .btn-secondary {
      background: white;
      border: 1.5px solid var(--border);
      padding: 0.65rem 1.25rem;
      border-radius: var(--radius);
      font-weight: 600;
      color: var(--text-main);
    }
    .btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
  `]
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
