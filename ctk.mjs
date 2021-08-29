// Creative Toolkit - by dave caruso
// Build Script

/* eslint-disable no-undef */
import fs from 'fs-extra';
import path from 'path';
import { build as viteBuild, createServer } from 'vite';
import { build as esbuild } from 'esbuild';
import { watch } from 'chokidar';
import { spawn } from 'child_process';

const dirname = path.dirname(import.meta.url.replace(/^file:\/\/\//, ''));

const pkg = fs.readJsonSync('./package.json');

const isRun = process.argv.includes('run');
const isBuild = process.argv.includes('build');

if (isRun && isBuild) process.exit(1);

async function buildBackend() {
  await esbuild({
    entryPoints: ['./backend/index.js'],
    outfile: './build/app/backend.js',
    minify: isBuild,
    bundle: true,
    platform: 'node',
    external: ['electron', 'esbuild', ...Object.keys(pkg.dependencies)],
    define: {
      __DEV__: !isBuild,
    },
  });
}

async function buildFrontend() {
  await viteBuild({
    root: path.join(dirname, './frontend'),
    config: 'vite.config.ts',
    build: {
      write: true,
      outDir: '../build/app',
      minify: isBuild,
    },
  });
}

async function buildJson() {
  await fs.writeJsonSync('./build/app/package.json', {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    main: './backend.js',
    dependencies: pkg.dependencies,
  });
}

export async function buildAll() {
  console.log('Building...');
  const start = Date.now();
  await fs.ensureDir('build/app');
  await Promise.all([buildBackend(), buildFrontend(), buildJson()]);
  console.log(`Build finished in ${Date.now() - start}ms`);
}

export async function runViteDevServer() {
  const server = await createServer({
    root: path.join(dirname, './frontend'),
    config: 'vite.config.ts',
    logLevel: 'silent',
  });
  server.watcher.on('change', (file) => {
    console.log(`File changed: ${file}`);
  });
  server.listen(3000);
}

export async function run() {
  runViteDevServer();

  let electron;
  async function restartElectron() {
    await buildBackend();
    if (electron) electron.kill();
    electron = spawn('node', [
      './node_modules/electron/cli.js',
      './build/app/backend.js',
      '--cache',
      path.join(dirname, '.cache'),
    ]);

    electron.stdout.pipe(process.stdout);
    electron.stderr.pipe(process.stderr);
  }

  const x = watch('./backend', { ignoreInitial: true });
  x.on('change', (x) => {
    // if (x.match(/backend(\/|\\)actions/)) return;
    console.log(`File changed: ${x}`);
    restartElectron();
  });

  restartElectron();
}

if (isRun) run();
if (isBuild) buildAll();
