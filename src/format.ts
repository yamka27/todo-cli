import type { Todo } from './types.js';
import { isOverdue } from './validators.js';

export function formatTodo(todo: Todo): string {
  const status = todo.status === 'done' ? '[x]' : '[ ]';
  const due = todo.due || '–';
  const tags = todo.tags.length > 0 ? ' ' + todo.tags.map(t => `#${t}`).join(' ') : '';
  const overdueSuffix = isOverdue(todo) ? ' (прострочено)' : '';

  return `#${todo.id}  ${status}  ${todo.priority.padEnd(7)} ${due.padEnd(12)} ${todo.title}${tags}${overdueSuffix}`;
}

export function formatTodoList(todos: Todo[]): string {
  if (todos.length === 0) {
    return 'Список порожній';
  }
  return todos.map(formatTodo).join('\n');
}

export function formatStats(todos: Todo[]): string {
  const total = todos.length;
  const open = todos.filter(t => t.status === 'todo').length;
  const done = todos.filter(t => t.status === 'done').length;
  const overdue = todos.filter(t => isOverdue(t)).length;

  const high = todos.filter(t => t.priority === 'high').length;
  const medium = todos.filter(t => t.priority === 'medium').length;
  const low = todos.filter(t => t.priority === 'low').length;

  return [
    `Усього: ${total} · відкритих: ${open} · виконаних: ${done} · прострочених: ${overdue}`,
    `high: ${high} · medium: ${medium} · low: ${low}`
  ].join('\n');
}

export function formatHelp(): string {
  return `
Доступні команди:

  add <title> [--priority p] [--due YYYY-MM-DD] [--tag t ...]
    Створити задачу

  list [--status s] [--priority p] [--tag t] [--sort k] [--json]
    Показати задачі

  done <id>
    Позначити задачу виконаною

  undo <id>
    Повернути задачу в роботу

  edit <id> [--title t] [--priority p] [--due d]
    Змінити задачу

  remove <id>
    Видалити задачу

  clear --done
    Видалити всі виконані задачі

  stats
    Показати статистику

  help
    Показати цю довідку
`.trim();
}