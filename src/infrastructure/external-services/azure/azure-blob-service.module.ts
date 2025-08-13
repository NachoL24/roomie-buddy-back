import { Module } from "@nestjs/common";
import { AzureBlobService } from "./azure-blob-service";

export const BlobServiceRepo = "BlobServiceRepo";
@Module({
    providers: [
        {
            provide: BlobServiceRepo,
            useClass: AzureBlobService,
        },
    ],
    exports: [BlobServiceRepo],
})
export class AzureBlobServiceModule {}