import { readdirSync } from 'fs';
import { join } from 'path';
import type { BotClient } from '../client';
import type { Command } from '../types';

export async function loadCommands(client: BotClient): Promise<void> {
  const commandsPath = join(__dirname, '..', 'commands');
  const categoryDirs = readdirSync(commandsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categoryDirs) {
    const categoryPath = join(commandsPath, category);
    const files = readdirSync(categoryPath).filter(
      (f) => f.endsWith('.ts') || f.endsWith('.js'),
    );

    for (const file of files) {
      const module = await import(join(categoryPath, file));
      const command: Command = module.default;

      if (!command?.data || !command?.execute) {
        console.warn(`[Commands] Skipping ${file}: missing data or execute`);
        continue;
      }

      client.commands.set(command.data.name, command);
      console.log(`[Commands] Loaded /${command.data.name} (${category})`);
    }
  }
}
