import { ValidationError } from './errors.js';
import type { Priority } from './types.js';

const VALID_PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('Назва задачі не може бути порожньою');
  }
  if (trimmed.length > 200) {
    throw new ValidationError(`Назва задачі довша за 200 символів (зараз: ${trimmed.length})`);
  }
  return trimmed;
}

export function validatePriority(priority: string): Priority {
  if (!VALID_PRIORITIES.includes(priority as Priority)) {
    throw new ValidationError(`Невідомий пріоритет "${priority}". Допустимі: low, medium, high`);
  }
  return priority as Priority;
}

export function validateDue(due: string): string {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(due)) {
    throw new ValidationError(`Некоректна дата "${due}". Формат: YYYY-MM-DD`);
  }

  const [year, month, day] = due.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new ValidationError(`Некоректна дата "${due}". Формат: YYYY-MM-DD`);
  }

  return due;
}

export function validateId(id: string): number {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) {
    throw new ValidationError('ID має бути цілим додатним числом');
  }
  return num;
}

export function validateTags(tags: string[]): string[] {
  return tags
    .map(tag => tag.replace(/^#/, '').toLowerCase())
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .filter(tag => tag.length > 0);
}

export function isOverdue(todo: { status: string; due: string | null }): boolean {
  if (todo.status !== 'todo' || !todo.due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(todo.due);
  return dueDate < today;
}