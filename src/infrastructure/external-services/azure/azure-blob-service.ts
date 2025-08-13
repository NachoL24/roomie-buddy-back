import { Injectable } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class AzureBlobService {
  private container: ContainerClient;

  constructor() {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const containerName = process.env.AZURE_BLOB_CONTAINER || 'avatares';
    const svc = BlobServiceClient.fromConnectionString(conn);
    this.container = svc.getContainerClient(containerName);
  }

  async uploadPublic(
    blobName: string,
    data: Buffer,
    contentType = 'image/webp',
    cacheSeconds = 60 * 60 * 24 * 30, // 30 días
  ): Promise<string> {
    await this.container.createIfNotExists({ access: 'blob' });
    const blob = this.container.getBlockBlobClient(blobName);
    await blob.uploadData(data, {
      blobHTTPHeaders: { blobContentType: contentType, blobCacheControl: `public, max-age=${cacheSeconds}` },
    });
    return blob.url; // URL pública
  }
}
