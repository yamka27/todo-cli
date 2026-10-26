import { unlink } from 'node:fs/promises';
import { getTodoFilePath } from '../src/storage.js';

async function reset(): Promise<void> {
  const filePath = getTodoFilePath();

  try {
    await unlink(filePath);
    console.log(`✓ Файл видалено: ${filePath}`);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('✓ Файл вже відсутній');
    } else {
      console.error(`✗ Помилка: ${err.message}`);
      process.exit(1);
    }
  }
}

reset();