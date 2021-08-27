// automation for Blackmagic Fusion 17 command line rendering
import { spawn } from 'child_process';
import { FUSION_PATH } from './paths';

function getCommandArgs(comp: string): string[] {
  return ['/render', comp, '/quit'];
}

export async function renderFusionFile(file: string): Promise<void> {
  const args = getCommandArgs(file);
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    console.log(`Rendering ${file}`);
    const child = spawn(FUSION_PATH, args, {
      stdio: 'pipe',
    });
    child.on('error', reject);
    child.on('close', (code) => {
      console.log(`render time: ${Date.now() - start}ms`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('fusion failed'));
      }
    });
  });
}
