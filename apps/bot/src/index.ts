import './config'; // Load env first
import { client } from './client';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import { config } from './config';

async function main() {
  await loadCommands(client);
  await loadEvents(client);
  await client.login(config.token);
}

main().catch((err) => {
  console.error('[Fatal] Failed to start bot:', err);
  process.exit(1);
});
