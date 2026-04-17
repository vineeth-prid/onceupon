import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

describe('UploadService', () => {
  let service: UploadService;
  const savedFiles: string[] = [];

  beforeEach(() => {
    service = new UploadService();
  });

  afterAll(async () => {
    for (const f of savedFiles) {
      try {
        await unlink(f);
      } catch {}
    }
  });

  const mockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
    ({
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('fake-image-data'),
      ...overrides,
    }) as Express.Multer.File;

  it('should save a file and return a URL path', async () => {
    const url = await service.savePhoto(mockFile());
    expect(url).toMatch(/^\/api\/uploads\/[\w-]+\.jpg$/);

    // URL is /api/uploads/file.jpg, actual file is in {cwd}/uploads/file.jpg
    const filename = url.replace(/^\/api\/uploads\//, '');
    const fullPath = join(process.cwd(), 'uploads', filename);
    savedFiles.push(fullPath);
    expect(existsSync(fullPath)).toBe(true);
  });

  it('should reject files over 10MB', async () => {
    await expect(
      service.savePhoto(mockFile({ size: 11 * 1024 * 1024 })),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject unsupported content types', async () => {
    await expect(
      service.savePhoto(mockFile({ mimetype: 'image/gif' })),
    ).rejects.toThrow(BadRequestException);
  });

  it('should accept PNG files', async () => {
    const url = await service.savePhoto(
      mockFile({ originalname: 'photo.png', mimetype: 'image/png' }),
    );
    expect(url).toMatch(/\.png$/);
    savedFiles.push(join(process.cwd(), 'uploads', url.replace(/^\/api\/uploads\//, '')));
  });

  it('should accept WebP files', async () => {
    const url = await service.savePhoto(
      mockFile({ originalname: 'photo.webp', mimetype: 'image/webp' }),
    );
    expect(url).toMatch(/\.webp$/);
    savedFiles.push(join(process.cwd(), 'uploads', url.replace(/^\/api\/uploads\//, '')));
  });
});
