import { Task } from '../models/task';

export function trackById(_: number, task: Task): number {
  return task.id;
}

