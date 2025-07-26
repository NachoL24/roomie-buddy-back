import { Injectable, Inject } from '@nestjs/common';
import { HouseRepository } from '../../domain/repositories/house.repository';
import { HOUSE_REPO_TOKEN } from '../../infrastructure/database/repositories/house-repository.module';

/**
 * Example of how to use the repository in a use case or service
 */
@Injectable()
export class ExampleHouseService {
    constructor(
        @Inject(HOUSE_REPO_TOKEN)
        private readonly houseRepository: HouseRepository
    ) { }

    async getAllHouses() {
        return await this.houseRepository.findAll();
    }

    async getHouseById(id: number) {
        return await this.houseRepository.findById(id);
    }

}
