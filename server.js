/**
 * Entry point: starts the HTTP server and handles graceful shutdown.
 *
 *   npm start
 */
import { createApp } from './src/app.js';
import { config } from './src/config.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(`YouTube Transcript Extractor listening on http://${config.host}:${config.port}`);
  console.log('  POST /api/transcript   { "videoUrl": "...", "format": "json|text|srt|vtt", "lang": "en,bn" }');
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close((err) => process.exit(err ? 1 : 0));
  // Force-exit if connections refuse to close.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
