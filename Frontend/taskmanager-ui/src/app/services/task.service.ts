import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, finalize, of, tap, throwError } from 'rxjs';
import { CreateTaskPayload, Task, UpdateTaskPayload } from '../models/task';

export type { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Task UI branch uses an in-memory store so the UI can be developed standalone.
  // The integration branch will swap these methods to real HTTP calls.
  private readonly simulatedLatencyMs = 350;

  private nextId = 1;

  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    const task: Task = {
      id: this.nextId++,
      title: payload.title,
      description: payload.description,
      completed: false,
      createdAt: new Date().toISOString()
    };

    return of(task).pipe(
      delay(this.simulatedLatencyMs),
      tap((t) => this.tasksSubject.next([...this.tasksSubject.value, t])),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  updateTask(id: number, payload: UpdateTaskPayload): Observable<Task> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    const current = this.tasksSubject.value;
    const existing = current.find((t) => t.id === id);

    if (!existing) {
      this.errorSubject.next(`Task not found: ${id}`);
      return throwError(() => new Error(`Task not found: ${id}`)).pipe(
        finalize(() => this.loadingSubject.next(false))
      );
    }

    const updated: Task = {
      ...existing,
      title: payload.title,
      description: payload.description,
      completed: payload.completed ?? existing.completed
    };

    return of(updated).pipe(
      delay(this.simulatedLatencyMs),
      tap(() => {
        const now = this.tasksSubject.value;
        this.tasksSubject.next(now.map((t) => (t.id === id ? updated : t)));
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  deleteTask(id: number): Observable<void> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    const current = this.tasksSubject.value;
    const exists = current.some((t) => t.id === id);

    if (!exists) {
      this.errorSubject.next(`Task not found: ${id}`);
      return throwError(() => new Error(`Task not found: ${id}`)).pipe(
        finalize(() => this.loadingSubject.next(false))
      );
    }

    return of(undefined).pipe(
      delay(this.simulatedLatencyMs),
      tap(() => this.removeFromStore(id)),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  toggleTask(id: number): Observable<Task> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    const current = this.tasksSubject.value;
    const existing = current.find((t) => t.id === id);

    if (!existing) {
      this.errorSubject.next(`Task not found: ${id}`);
      return throwError(() => new Error(`Task not found: ${id}`)).pipe(
        finalize(() => this.loadingSubject.next(false))
      );
    }

    const updated: Task = { ...existing, completed: !existing.completed };

    return of(updated).pipe(
      delay(this.simulatedLatencyMs),
      tap(() => this.tasksSubject.next(this.tasksSubject.value.map((t) => (t.id === id ? updated : t)))),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  private removeFromStore(taskId: number): void {
    this.tasksSubject.next(this.tasksSubject.value.filter((t) => t.id !== taskId));
  }
}