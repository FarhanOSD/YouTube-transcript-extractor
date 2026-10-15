#!/usr/bin/env node
/**
 * Command-line transcript extractor.
 *
 *   node extract.js <youtube-url-or-id> [options]
 *
 * The transcript goes to stdout (or --out file); status messages go to stderr,
 * so the output can be piped safely.
 */
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { AppError } from './src/errors.js';
import { transcriptService } from './src/services/transcriptService.js';

const HELP = `YouTube Transcript Extractor

Usage:
  node extract.js <youtube-url-or-video-id> [options]

Options:
  -f, --format <fmt>   text | json | srt | vtt           (default: text)
  -l, --lang <codes>   Preferred languages, in priority order, e.g. "en" or "bn,en".
                       Omit or use "auto" to use the video's default language.
      --no-fallback    Fail instead of falling back when the language is missing
  -o, --out <file>     Write to a file instead of stdout
      --list           List available caption languages and exit
  -h, --help           Show this help

Examples:
  node extract.js https://youtu.be/dQw4w9WgXcQ
  node extract.js dQw4w9WgXcQ --format srt --lang en --out captions.srt
  node extract.js "https://youtube.com/shorts/dQw4w9WgXcQ" -f json -l bn,en
  node extract.js dQw4w9WgXcQ --list
`;

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        format: { type: 'string', short: 'f', default: 'text' },
        lang: { type: 'string', short: 'l' },
        out: { type: 'string', short: 'o' },
        'no-fallback': { type: 'boolean', default: false },
        list: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (err) {
    fail(`${err.message}\n\n${HELP}`, 2);
  }

  const { values, positionals } = parsed;
  if (values.help) {
    console.log(HELP);
    return;
  }
  if (positionals.length !== 1) fail(`Expected exactly one YouTube URL or video ID.\n\n${HELP}`, 2);

  const [videoInput] = positionals;

  if (values.list) {
    const { videoId, languages } = await transcriptService.listLanguages(videoInput);
    console.error(`Caption languages for ${videoId}:`);
    for (const l of languages) {
      console.log(`${l.code.padEnd(10)} ${l.kind.padEnd(15)} ${l.name}`);
    }
    return;
  }

  const result = await transcriptService.getTranscript(videoInput, {
    format: values.format,
    lang: values.lang,
    fallback: !values['no-fallback'],
  });

  console.error(
    `Language: ${result.language.code} (${result.language.kind})` +
      (result.fallbackUsed ? ` - requested ${result.requestedLanguages.join(', ')} was not available` : '') +
      ` | ${result.segmentCount} segments`,
  );

  if (values.out) {
    await writeFile(values.out, result.body, 'utf8');
    console.error(`Saved to ${values.out}`);
  } else {
    process.stdout.write(`${result.body}\n`);
  }
}

main().catch((err) => {
  if (err instanceof AppError) {
    fail(`Error [${err.code}]: ${err.message}`);
  }
  console.error('Unexpected error:', err);
  process.exit(1);
});
