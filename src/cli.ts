import { parseArgs } from 'node:util';
import { load, save } from './storage.js';
import {
  addTodo,
  listTodos,
  doneTodo,
  undoTodo,
  editTodo,
  removeTodo,
  clearDone
} from './commands.js';
import { formatTodoList, formatStats, formatHelp } from './format.js';
import { validateId } from './validators.js';
import { ValidationError, NotFoundError, StorageError } from './errors.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help') {
    console.log(formatHelp());
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  try {
    let data = await load();
    let output = '';

    switch (command) {
      case 'add': {
        const { values, positionals } = parseArgs({
          args: commandArgs,
          options: {
            priority: { type: 'string' },
            due: { type: 'string' },
            tag: { type: 'string', multiple: true }
          },
          strict: true,
          allowPositionals: true
        });

        if (positionals.length === 0) {
          throw new ValidationError('Назва задачі не може бути порожньою');
        }

        const title = positionals.join(' ');
        const priority = values.priority || 'medium';
        const due = values.due || null;
        const tags = values.tag || [];

        const result = addTodo(data, title, priority, due, tags);
        data = result.data;
        await save(data);
        output = `✓ ${result.message}`;
        break;
      }

      case 'list': {
        const { values } = parseArgs({
          args: commandArgs,
          options: {
            status: { type: 'string' },
            priority: { type: 'string' },
            tag: { type: 'string' },
            sort: { type: 'string' },
            json: { type: 'boolean' }
          },
          strict: true,
          allowPositionals: true
        });

        const todos = listTodos(
          data,
          values.status,
          values.priority,
          values.tag,
          values.sort
        );

        if (values.json) {
          output = JSON.stringify(todos, null, 2);
        } else {
          output = formatTodoList(todos);
        }
        break;
      }

      case 'done': {
        if (commandArgs.length === 0) {
          throw new ValidationError('ID має бути цілим додатним числом');
        }

        const id = validateId(commandArgs[0]);
        const result = doneTodo(data, id);
        data = result.data;
        await save(data);
        output = `✓ ${result.message}`;
        break;
      }

      case 'undo': {
        if (commandArgs.length === 0) {
          throw new ValidationError('ID має бути цілим додатним числом');
        }

        const id = validateId(commandArgs[0]);
        const result = undoTodo(data, id);
        data = result.data;
        await save(data);
        output = `✓ ${result.message}`;
        break;
      }

      case 'edit': {
        if (commandArgs.length === 0) {
          throw new ValidationError('ID має бути цілим додатним числом');
        }

        const { values } = parseArgs({
          args: commandArgs.slice(1),
          options: {
            title: { type: 'string' },
            priority: { type: 'string' },
            due: { type: 'string' }
          },
          strict: true,
          allowPositionals: true
        });

        const id = validateId(commandArgs[0]);
        const result = editTodo(
          data,
          id,
          values.title,
          values.priority,
          values.due
        );
        data = result.data;
        await save(data);
        output = `✓ ${result.message}`;
        break;
      }

      case 'remove': {
        if (commandArgs.length === 0) {
          throw new ValidationError('ID має бути цілим додатним числом');
        }

        const id = validateId(commandArgs[0]);
        const result = removeTodo(data, id);
        data = result.data;
        await save(data);
        output = `✓ ${result.message}`;
        break;
      }

      case 'clear': {
        const { values } = parseArgs({
          args: commandArgs,
          options: {
            done: { type: 'boolean' }
          },
          strict: true,
          allowPositionals: true
        });

        if (!values.done) {
          throw new ValidationError('Потрібен прапорець --done');
        }

        const result = clearDone(data);
        data = result.data;
        await save(data);
        output = `✓ ${result.message}`;
        break;
      }

      case 'stats': {
        output = formatStats(data.todos);
        break;
      }

      default:
        console.error(`✗ Невідома команда "${command}". Див. todo help`);
        process.exit(1);
    }

    if (output) {
      console.log(output);
    }

    process.exit(0);
  } catch (err: any) {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      console.error(`✗ ${err.message}`);
      process.exit(1);
    }
    if (err instanceof StorageError) {
      console.error(`✗ ${err.message}`);
      process.exit(2);
    }
    if (err.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
      console.error(`✗ Невідомий прапорець ${err.message}`);
      process.exit(1);
    }
    console.error(`✗ Внутрішня помилка: ${err.message}`);
    process.exit(1);
  }
}

main();