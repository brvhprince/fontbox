import { promises as fs } from 'fs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const registerFontMock = vi.fn();
const ctx = {
  fillStyle: '',
  font: '',
  fillRect: vi.fn(),
  fillText: vi.fn(),
};

const canvasMock = {
  width: 800,
  height: 320,
  getContext: vi.fn(() => ctx),
  toBuffer: vi.fn(() => Buffer.from('preview')),
};

vi.mock('canvas', () => ({
  registerFont: registerFontMock,
  createCanvas: vi.fn(() => canvasMock),
}));

vi.mock('os', () => ({
  tmpdir: () => '/tmp',
}));

describe('generatePreview', () => {
  beforeEach(() => {
    registerFontMock.mockClear();
    ctx.fillRect.mockClear();
    ctx.fillText.mockClear();
    canvasMock.getContext.mockClear();
    canvasMock.toBuffer.mockClear();
  });

  it('renders a preview image for the uploaded font', async () => {
    const mkdtemp = vi.spyOn(fs, 'mkdtemp').mockResolvedValue('/tmp/fontbox-123');
    const writeFile = vi.spyOn(fs, 'writeFile').mockResolvedValue();
    const rm = vi.spyOn(fs, 'rm').mockResolvedValue();

    const { generatePreview } = await import('./previewService.js');
    const result = await generatePreview('font-id', 'My Font', Buffer.from('font-data'));

    expect(mkdtemp).toHaveBeenCalledWith('/tmp/fontbox-');
    expect(writeFile).toHaveBeenCalledWith('/tmp/fontbox-123/font-id.font', Buffer.from('font-data'));
    expect(registerFontMock).toHaveBeenCalledWith('/tmp/fontbox-123/font-id.font', { family: 'Fontbox-font-id' });
    expect(canvasMock.getContext).toHaveBeenCalledWith('2d');
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('Fontbox'), 40, expect.any(Number));
    expect(canvasMock.toBuffer).toHaveBeenCalledWith('image/png');
    expect(result).toEqual({ buffer: Buffer.from('preview'), width: 800, height: 320 });
    expect(rm).toHaveBeenNthCalledWith(1, '/tmp/fontbox-123/font-id.font', { force: true });
    expect(rm).toHaveBeenNthCalledWith(2, '/tmp/fontbox-123', { recursive: true, force: true });

    mkdtemp.mockRestore();
    writeFile.mockRestore();
    rm.mockRestore();
  });
});
