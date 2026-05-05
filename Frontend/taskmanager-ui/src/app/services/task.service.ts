import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, throwError } from 'rxjs';
import { tap } from 'rxjs';

import { CreateTaskPayload, Task, UpdateTaskPayload } from '../models/task';

export type { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = 'http://localhost:8080/api/tasks';

  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  loadTasks(): Observable<Task[]> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap((tasks) => this.tasksSubject.next(tasks)),
      finalize(() => this.loadingSubject.next(false)),
      catchError((err) => {
        this.errorSubject.next(this.extractErrorMessage(err));
        return throwError(() => err);
      })
    );
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    return this.http.post<Task>(this.apiUrl, payload).pipe(
      tap((task) => this.upsert(task)),
      finalize(() => this.loadingSubject.next(false)),
      catchError((err) => {
        this.errorSubject.next(this.extractErrorMessage(err));
        return throwError(() => err);
      })
    );
  }

  updateTask(id: number, payload: UpdateTaskPayload): Observable<Task> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    return this.http.put<Task>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((task) => this.upsert(task)),
      finalize(() => this.loadingSubject.next(false)),
      catchError((err) => {
        this.errorSubject.next(this.extractErrorMessage(err));
        return throwError(() => err);
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.tasksSubject.next(this.tasksSubject.value.filter((t) => t.id !== id))),
      finalize(() => this.loadingSubject.next(false)),
      catchError((err) => {
        this.errorSubject.next(this.extractErrorMessage(err));
        return throwError(() => err);
      })
    );
  }

  toggleTask(id: number): Observable<Task> {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    // Backend ignores request body for this endpoint; `{}` keeps Angular happy.
    return this.http.patch<Task>(`${this.apiUrl}/${id}/toggle`, {}).pipe(
      tap((task) => this.upsert(task)),
      finalize(() => this.loadingSubject.next(false)),
      catchError((err) => {
        this.errorSubject.next(this.extractErrorMessage(err));
        return throwError(() => err);
      })
    );
  }

  private upsert(task: Task): void {
    const current = this.tasksSubject.value;
    const exists = current.some((t) => t.id === task.id);
    this.tasksSubject.next(
      exists ? current.map((t) => (t.id === task.id ? task : t)) : [...current, task]
    );
  }

  private extractErrorMessage(err: unknown): string {
    const anyErr = err as any;
    const message =
      anyErr?.error?.message ??
      anyErr?.message ??
      'Request failed';
    return typeof message === 'string' ? message : 'Request failed';
  }
}