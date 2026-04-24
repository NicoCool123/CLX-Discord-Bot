import './config'; // Load env first
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from './config';
import type { Command } from './types';

async function deploy() {
  const commands = [];
  const commandsPath = join(__dirname, 'commands');

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
      if (command?.data) {
        commands.push(command.data.toJSON());
      }
    }
  }

  const rest = new REST().setToken(config.token);

  console.log(`Deploying ${commands.length} application commands...`);
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  console.log(`Successfully deployed ${commands.length} commands.`);
}

deploy().catch(console.error);
