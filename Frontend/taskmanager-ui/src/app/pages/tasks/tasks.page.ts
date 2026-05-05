import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Task, UpdateTaskPayload } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { trackById } from '../../core/track-by';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './tasks.page.html',
  styleUrl: './tasks.page.css'
})
export class TasksPage implements OnInit {
  readonly tasks$: Observable<Task[]> = this.taskService.tasks$;
  readonly loading$ = this.taskService.loading$;
  readonly error$ = this.taskService.error$;

  readonly activeTasks$ = this.tasks$.pipe(
    map((tasks) => tasks.filter((t) => !t.completed))
  );

  readonly completedTasks$ = this.tasks$.pipe(
    map((tasks) => tasks.filter((t) => t.completed))
  );

  readonly hasTasks$ = this.tasks$.pipe(
    map((tasks) => tasks.length > 0)
  );

  readonly trackById = trackById;

  addForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  editForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  editingId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.taskService.loadTasks().subscribe({
      error: () => {
        // error is exposed via the service; no-op here
      }
    });
  }

  formatCreatedAt(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleString();
  }

  onAdd(): void {
    if (this.addForm.invalid) return;
    const payload = this.addForm.value as { title: string; description: string };

    this.taskService.createTask(payload).subscribe({
      next: () => this.addForm.reset(),
      error: () => {
        // error is exposed via the service; no-op here
      }
    });
  }

  startEdit(task: Task): void {
    this.editingId = task.id;
    this.editForm.setValue({
      title: task.title,
      description: task.description
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset();
  }

  saveEdit(task: Task): void {
    if (this.editForm.invalid) return;
    const payload = this.editForm.value as { title: string; description: string };

    const updatePayload: UpdateTaskPayload = {
      title: payload.title,
      description: payload.description
    };

    this.taskService.updateTask(task.id, updatePayload).subscribe({
      next: () => this.cancelEdit(),
      error: () => {
        // error is exposed via the service; keep edit state
      }
    });
  }

  toggle(task: Task): void {
    this.taskService.toggleTask(task.id).subscribe({
      error: () => {
        // error is exposed via the service; no-op
      }
    });
  }

  delete(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe({
      error: () => {
        // error is exposed via the service; no-op
      },
      complete: () => {
        if (this.editingId === task.id) this.cancelEdit();
      }
    });
  }
}

