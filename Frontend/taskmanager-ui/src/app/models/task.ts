export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string; // ISO string from backend (or set in-memory for the UI)
}

export interface CreateTaskPayload {
  title: string;
  description: string;
}

export interface UpdateTaskPayload {
  title: string;
  description: string;
  completed?: boolean;
}