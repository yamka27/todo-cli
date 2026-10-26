export type Status = 'todo' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  due: string | null;
  tags: string[];
  createdAt: string;
  doneAt: string | null;
}

export interface TodoData {
  version: number;
  nextId: number;
  todos: Todo[];
}