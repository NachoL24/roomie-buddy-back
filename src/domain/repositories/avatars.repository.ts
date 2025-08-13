export interface AvatarsRepository {
    uploadPublic(
    blobName: string,
    data: Buffer,
    contentType?: string,
    cacheSeconds?: number,
  ): Promise<string>
}
