import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { AvatarsRepository } from 'src/domain/repositories/avatars.repository';
import { BlobServiceRepo } from 'src/infrastructure/external-services/azure/azure-blob-service.module';

@Injectable()
export class AvatarsService {
  private size = Number(process.env.AVATAR_SIZE || 256);
  constructor(@Inject(BlobServiceRepo) private readonly blob: AvatarsRepository) { }

  async migrateFromUrl(userId: string, sourceUrl: string): Promise<string | null> {
    try {
      console.log("Migrating avatar from URL:", sourceUrl);
      const r = await axios.get<ArrayBuffer>(sourceUrl, {
        responseType: 'arraybuffer',
        timeout: 8000,
        maxRedirects: 2,
        validateStatus: s => s >= 200 && s < 400,
      });
      console.log("Fetched avatar data successfully");
      const contentType = (r.headers && (r.headers['content-type'] || r.headers['Content-Type'])) as string | undefined;
      const byteLen = (r.data as ArrayBuffer)?.byteLength ?? 0;
      console.log("Avatar response headers:", { contentType, byteLen });
      // Dynamically import sharp to support ESM-only package in a CJS build
      const sharpMod = await import('sharp');
      const sharpFn: any = (sharpMod as any).default ?? sharpMod;
      if (typeof sharpFn !== 'function') {
        console.error('Sharp module did not export a function. Got:', typeof sharpFn);
        return null;
      }
      const webp = await sharpFn(Buffer.from(r.data))
        .resize(this.size, this.size, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();
      console.log("Converted avatar to WebP format successfully");

      // versión simple; si querés “cache-busting” usá `${userId}-${Date.now()}.webp`
      const url = await this.blob.uploadPublic(`${userId}.webp`, webp, 'image/webp');
      return url;
    } catch (e) {
      console.error("Avatar migration failed:", e);
      return null;
    }
  }

  needsMigration(currentUrl?: string | null): boolean {
    if (!currentUrl) return true;
    const u = currentUrl.toLowerCase();
    return u.includes('lh3.googleusercontent.com') || u.includes('gravatar.com');
  }
}
