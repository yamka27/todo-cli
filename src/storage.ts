import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { StorageError } from './errors.js';
import type { TodoData } from './types.js';

export function getTodoFilePath(): string {
  return process.env.TODO_FILE || 'D:/test/todos.json';
}

export async function load(): Promise<TodoData> {
  const filePath = getTodoFilePath();

  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data || typeof data !== 'object' || !Array.isArray(data.todos)) {
      throw new StorageError(`Файл даних пошкоджено: ${filePath}. Виправте або видаліть його`);
    }

    return data as TodoData;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return { version: 1, nextId: 1, todos: [] };
    }
    if (err.code === 'EACCES' || err.code === 'EISDIR') {
      throw new StorageError(`Немає прав доступу: ${filePath}. Причина: ${err.code}`);
    }
    if (err instanceof StorageError) {
      throw err;
    }
    if (err instanceof SyntaxError) {
      throw new StorageError(`Файл даних пошкоджено: ${filePath}. Виправте або видаліть його`);
    }
    throw new StorageError(`Помилка читання файлу: ${filePath}. ${err.message}`);
  }
}

export async function save(data: TodoData): Promise<void> {
  const filePath = getTodoFilePath();
  const tmpPath = filePath + '.tmp';

  try {
    await mkdir(dirname(filePath), { recursive: true });
    const content = JSON.stringify(data, null, 2) + '\n';
    
    // Атомарний запис: спочатку в тимчасовий файл, потім rename
    await writeFile(tmpPath, content, 'utf-8');
    await rename(tmpPath, filePath);
  } catch (err: any) {
    if (err.code === 'EACCES' || err.code === 'EISDIR') {
      throw new StorageError(`Немає прав запису: ${filePath}. Причина: ${err.code}`);
    }
    throw new StorageError(`Помилка запису файлу: ${filePath}. ${err.message}`);
  }
}