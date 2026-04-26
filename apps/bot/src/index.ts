import './config'; // Load env first
import { client } from './client';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import { config } from './config';
import { Events, ActivityType } from 'discord.js';

async function main() {
  await loadCommands(client);
  await loadEvents(client);
  await client.login(config.token);
}

main().catch((err) => {
  console.error('[Fatal] Failed to start bot:', err);
  process.exit(1);
});

client.once(Events.ClientReady, (c) => {
  const updateActivity = () => {
    const count = c.guilds.cache.size;
    c.user.setActivity(`${count} servers`, {
      type: ActivityType.Watching,
    });
  };

  updateActivity();
  setInterval(updateActivity, 60_000); // jede Minute
});
