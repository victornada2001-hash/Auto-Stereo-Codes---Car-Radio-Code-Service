import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const source = new URL('../../tjsdates/', import.meta.url);
const output = new URL('../www/', import.meta.url);
const packageFile = new URL('../src/native.mjs', import.meta.url);

const html = await readFile(new URL('index.html', source), 'utf8');
const supabaseScript = /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@[^"]+"><\/script>/;
if (!supabaseScript.test(html)) throw new Error('No se encontró el punto de arranque de Supabase en index.html.');

const policy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://raw.githubusercontent.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "font-src 'self' data:",
].join('; ');
const nativeHtml = html
  .replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/>\n<meta http-equiv="Content-Security-Policy" content="' + policy + '">')
  .replace(/<link rel="manifest"[^>]*>\s*/, '')
  .replace(supabaseScript, '<script src="/tjsdates-native.js"></script>');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(source, { withFileTypes: true })) {
  if (entry.isFile() && /\.(js|css|svg)$/.test(entry.name) && entry.name !== 'sw.js') {
    await copyFile(new URL(entry.name, source), new URL(entry.name, output));
  }
}
await writeFile(new URL('index.html', output), nativeHtml);
await build({
  entryPoints: [fileURLToPath(packageFile)],
  outfile: fileURLToPath(new URL('tjsdates-native.js', output)),
  bundle: true,
  minify: true,
  format: 'iife',
  legalComments: 'linked',
  target: ['ios15', 'chrome89'],
});
