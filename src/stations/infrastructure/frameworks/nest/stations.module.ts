import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Station } from '../../persistence/typeorm/station.orm-entity';
import { StationsController } from '../../../interface/http/stations.controller';
import { STATIONS_REPOSITORY } from '../../../domain/repositories/stations.repository';
import { TypeOrmStationsRepository } from '../../persistence/typeorm/typeorm-stations.repository';
import { CreateStationUseCase } from '../../../application/use-cases/create-station.use-case';
import { ListStationsUseCase } from '../../../application/use-cases/list-stations.use-case';
import { DeleteStationUseCase } from '../../../application/use-cases/delete-station.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Station])],
  controllers: [StationsController],
  providers: [
    { provide: STATIONS_REPOSITORY, useClass: TypeOrmStationsRepository },
    CreateStationUseCase,
    ListStationsUseCase,
    DeleteStationUseCase,
  ],
  exports: [TypeOrmModule, STATIONS_REPOSITORY, ListStationsUseCase],
})
export class StationsModule {}
