import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOADS_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class UploadService {
  async savePhoto(file: Express.Multer.File): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size must be under 10MB');
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(join(UPLOADS_DIR, filename), file.buffer);

    return `/uploads/${filename}`;
  }
}
