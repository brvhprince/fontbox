import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createCanvas, registerFont } from 'canvas';

export interface PreviewResult {
  buffer: Buffer;
  width: number;
  height: number;
}

export async function generatePreview(fontId: string, fontName: string, buffer: Buffer): Promise<PreviewResult> {
  const tempDir = await fs.mkdtemp(join(tmpdir(), 'fontbox-'));
  const tempPath = join(tempDir, `${fontId}.font`);
  await fs.writeFile(tempPath, buffer);
  const family = `Fontbox-${fontId}`;
  registerFont(tempPath, { family });

  try {
    const canvas = createCanvas(800, 320);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111827';
    ctx.font = `48px "${family}"`;
    ctx.fillText('Fontbox Preview', 40, 120);

    ctx.font = `32px "${family}"`;
    ctx.fillText(fontName, 40, 200);

    ctx.font = `20px "${family}"`;
    ctx.fillText('The quick brown fox jumps over the lazy dog 0123456789', 40, 260);

    const png = canvas.toBuffer('image/png');
    return { buffer: png, width: canvas.width, height: canvas.height };
  } finally {
    await fs.rm(tempPath, { force: true });
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
