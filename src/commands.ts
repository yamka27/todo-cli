import type { Todo, TodoData, Priority } from './types.js';
import { validateTitle, validatePriority, validateDue, validateTags, isOverdue } from './validators.js';
import { NotFoundError, ValidationError } from './errors.js';

export function addTodo(
  data: TodoData,
  title: string,
  priority: string = 'medium',
  due: string | null = null,
  tags: string[] = []
): { data: TodoData; message: string } {
  const validatedTitle = validateTitle(title);
  const validatedPriority = validatePriority(priority);
  const validatedTags = validateTags(tags);

  if (due) {
    validateDue(due);
  }

  const newTodo: Todo = {
    id: data.nextId,
    title: validatedTitle,
    status: 'todo',
    priority: validatedPriority,
    due: due || null,
    tags: validatedTags,
    createdAt: new Date().toISOString(),
    doneAt: null
  };

  return {
    data: {
      ...data,
      nextId: data.nextId + 1,
      todos: [...data.todos, newTodo]
    },
    message: `Додано #${newTodo.id}: ${validatedTitle}`
  };
}

export function listTodos(
  data: TodoData,
  status?: string,
  priority?: string,
  tag?: string,
  sort?: string
): Todo[] {
  let filtered = [...data.todos];

  if (status && status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }

  if (priority) {
    filtered = filtered.filter(t => t.priority === priority);
  }

  if (tag) {
    filtered = filtered.filter(t => t.tags.includes(tag.toLowerCase()));
  }

  filtered.sort((a, b) => {
    if (sort === 'priority') {
      const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }
    if (sort === 'due') {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    }
    return a.id - b.id;
  });

  return filtered;
}

export function doneTodo(data: TodoData, id: number): { data: TodoData; message: string } {
  const todo = data.todos.find(t => t.id === id);

  if (!todo) {
    throw new NotFoundError(`Задачу #${id} не знайдено`);
  }

  if (todo.status === 'done') {
    return { data, message: `#${id} вже виконана` };
  }

  const updatedTodos = data.todos.map(t =>
    t.id === id ? { ...t, status: 'done' as const, doneAt: new Date().toISOString() } : t
  );

  return {
    data: { ...data, todos: updatedTodos },
    message: `#${id} виконано`
  };
}

export function undoTodo(data: TodoData, id: number): { data: TodoData; message: string } {
  const todo = data.todos.find(t => t.id === id);

  if (!todo) {
    throw new NotFoundError(`Задачу #${id} не знайдено`);
  }

  if (todo.status === 'todo') {
    return { data, message: `#${id} вже в роботі` };
  }

  const updatedTodos = data.todos.map(t =>
    t.id === id ? { ...t, status: 'todo' as const, doneAt: null } : t
  );

  return {
    data: { ...data, todos: updatedTodos },
    message: `#${id} повернуто в роботу`
  };
}

export function editTodo(
  data: TodoData,
  id: number,
  title?: string,
  priority?: string,
  due?: string
): { data: TodoData; message: string } {
  const todo = data.todos.find(t => t.id === id);

  if (!todo) {
    throw new NotFoundError(`Задачу #${id} не знайдено`);
  }

  if (title === undefined && priority === undefined && due === undefined) {
    throw new ValidationError('Нічого змінювати: передайте --title, --priority або --due');
  }

  const updatedTodos = data.todos.map(t => {
    if (t.id !== id) return t;

    const updated = { ...t };

    if (title !== undefined) {
      updated.title = validateTitle(title);
    }

    if (priority !== undefined) {
      updated.priority = validatePriority(priority);
    }

    if (due !== undefined) {
      if (due === 'none') {
        updated.due = null;
      } else {
        updated.due = validateDue(due);
      }
    }

    return updated;
  });

  return {
    data: { ...data, todos: updatedTodos },
    message: `#${id} оновлено`
  };
}

export function removeTodo(data: TodoData, id: number): { data: TodoData; message: string } {
  const todo = data.todos.find(t => t.id === id);

  if (!todo) {
    throw new NotFoundError(`Задачу #${id} не знайдено`);
  }

  return {
    data: { ...data, todos: data.todos.filter(t => t.id !== id) },
    message: `Видалено #${id}: ${todo.title}`
  };
}

export function clearDone(data: TodoData): { data: TodoData; message: string } {
  const doneTodos = data.todos.filter(t => t.status === 'done');

  if (doneTodos.length === 0) {
    return { data, message: 'Немає виконаних задач' };
  }

  return {
    data: { ...data, todos: data.todos.filter(t => t.status !== 'done') },
    message: `Видалено виконаних: ${doneTodos.length}`
  };
}