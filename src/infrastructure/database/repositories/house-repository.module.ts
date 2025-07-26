import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House as DbHouse } from '../entities/house.db-entity';
import { TypeOrmHouseRepository } from './house.repository.impl';

export const HOUSE_REPO_TOKEN = Symbol('HOUSE_REPOSITORY');

@Module({
  imports: [TypeOrmModule.forFeature([DbHouse])],  // 👈 necesario
  providers: [
    TypeOrmHouseRepository,                        // 👈 explícalo
    {
      provide: HOUSE_REPO_TOKEN,                   // puerto hexagonal
      useExisting: TypeOrmHouseRepository,         // usa la misma instancia
    },
  ],
  exports: [HOUSE_REPO_TOKEN],
})
export class HouseRepositoryModule {}
