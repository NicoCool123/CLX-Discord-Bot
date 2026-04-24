import { readdirSync } from 'fs';
import { join } from 'path';
import type { BotClient } from '../client';
import type { Event } from '../types';

export async function loadEvents(client: BotClient): Promise<void> {
  const eventsPath = join(__dirname, '..', 'events');
  const files = readdirSync(eventsPath).filter(
    (f) => f.endsWith('.ts') || f.endsWith('.js'),
  );

  for (const file of files) {
    const module = await import(join(eventsPath, file));
    const event: Event = module.default;

    if (!event?.name || !event?.execute) {
      console.warn(`[Events] Skipping ${file}: missing name or execute`);
      continue;
    }

    const method = event.once ? 'once' : 'on';
    client[method](event.name, (...args: unknown[]) => event.execute(...args));
    console.log(`[Events] Registered event: ${event.name}`);
  }
}
