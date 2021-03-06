import fs from 'fs';
import config from './config';
import { DebugTypes } from './types';

let debug_file_count = 0;

export async function write_debug_file(content: any, filename: string): Promise<void> {
  if (config.DEBUG === DebugTypes.file) {
    const filepath = `../data/${debug_file_count++}_${filename}.json`;
    await fs.writeFileSync(filepath, JSON.stringify(content, null, 2));
    console.log('wrote:', filepath);
    return;
  } else if (config.DEBUG === DebugTypes.log) {
    console.log(content);
  }
}
