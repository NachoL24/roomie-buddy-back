import { Module } from "@nestjs/common";
import { AzureBlobService } from "src/infrastructure/external-services/azure/azure-blob-service";
import { AvatarsService } from "./avatar-service";
import { RepositoriesModule } from "src/infrastructure/database/repositories";

@Module({
    imports: [RepositoriesModule],
    providers: [AvatarsService],
    exports:   [AvatarsService],
})
export class AvatarsModule {}
