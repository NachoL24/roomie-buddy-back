import { Module } from "@nestjs/common";
import { AzureBlobService } from "src/infrastructure/external-services/azure/azure-blob-service";
import { AvatarsService } from "./avatar-service";

@Module({
  providers: [AzureBlobService, AvatarsService],
  exports:   [AvatarsService],
})
export class AvatarsModule {}
