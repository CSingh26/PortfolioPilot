import fs from 'fs/promises';
import path from 'path';

import { config } from './config';

export async function ensureRunsDir(): Promise<void> {
  await fs.mkdir(config.runsDir, { recursive: true });
}

export async function saveRunArtifacts(runId: string, payload: unknown): Promise<string> {
  await ensureRunsDir();
  const filePath = path.join(config.runsDir, `${runId}.json`);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

export async function loadRunArtifacts(filePath: string): Promise<unknown | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
