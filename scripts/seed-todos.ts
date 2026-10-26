import { faker } from '@faker-js/faker';
import { save, load } from '../src/storage.js';
import type { Todo } from '../src/types.js';

async function seed(): Promise<void> {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 30;

  const data = await load();

  for (let i = 0; i < count; i++) {
    const priorities = ['low', 'medium', 'high'] as const;
    const statuses = ['todo', 'done'] as const;

    const isDone = Math.random() > 0.5;
    const hasDue = Math.random() > 0.5;
    const hasTags = Math.random() > 0.5;

    const todo: Todo = {
      id: data.nextId++,
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      status: faker.helpers.arrayElement(statuses),
      priority: faker.helpers.arrayElement(priorities),
      due: hasDue ? faker.date.future().toISOString().split('T')[0] : null,
      tags: hasTags ? [faker.lorem.word().toLowerCase()] : [],
      createdAt: faker.date.past().toISOString(),
      doneAt: isDone ? faker.date.recent().toISOString() : null
    };

    data.todos.push(todo);
  }

  await save(data);
  console.log(`✓ Створено ${count} тестових задач`);
}

seed().catch(err => {
  console.error(`✗ Помилка: ${err.message}`);
  process.exit(1);
});