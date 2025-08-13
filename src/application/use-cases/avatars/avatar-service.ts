import { Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import { AzureBlobService } from '../../../infrastructure/external-services/azure/azure-blob-service';

@Injectable()
export class AvatarsService {
  private size = Number(process.env.AVATAR_SIZE || 256);
  constructor(private blob: AzureBlobService) {}

  async migrateFromUrl(userId: string, sourceUrl: string): Promise<string | null> {
    try {
      const r = await axios.get<ArrayBuffer>(sourceUrl, {
        responseType: 'arraybuffer',
        timeout: 8000,
        maxRedirects: 2,
        validateStatus: s => s >= 200 && s < 400,
      });
      const webp = await sharp(Buffer.from(r.data))
        .resize(this.size, this.size, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();

      // versión simple; si querés “cache-busting” usá `${userId}-${Date.now()}.webp`
      const url = await this.blob.uploadPublic(`${userId}.webp`, webp, 'image/webp');
      return url;
    } catch {
      return null;
    }
  }

  needsMigration(currentUrl?: string | null): boolean {
    if (!currentUrl) return true;
    const u = currentUrl.toLowerCase();
    return u.includes('lh3.googleusercontent.com') || u.includes('gravatar.com');
  }
}
