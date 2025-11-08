import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';

const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`API server listening on port ${env.PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down');
  server.close(() => process.exit(0));
});
