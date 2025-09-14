import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from '../../persistence/typeorm/trip.orm-entity';
import { StopTime } from '../../persistence/typeorm/trip_stop_time.orm-entity';
import { TripsController } from '../../../interface/http/trips.controller';
import { TRIPS_REPOSITORY } from '../../../domain/repositories/trips.repository';
import { TypeOrmTripsRepository } from '../../persistence/typeorm/typeorm-trips.repository';
import { ListTripsUseCase } from '../../../application/use-cases/list-trips.use-case';
import { GetTripUseCase } from '../../../application/use-cases/get-trip.use-case';
import { CreateTripUseCase } from '../../../application/use-cases/create-trip.use-case';
import { ReplaceTripUseCase } from '../../../application/use-cases/replace-trip.use-case';
import { DeleteTripUseCase } from '../../../application/use-cases/delete-trip.use-case';
import { SearchTripsUseCase } from '../../../application/use-cases/search-trips.use-case';
import { PatchTripUseCase } from '../../../application/use-cases/patch-trip.use-case';
import { StationsModule } from '../../../../stations/infrastructure/frameworks/nest/stations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, StopTime]), StationsModule],
  controllers: [TripsController],
  providers: [
    { provide: TRIPS_REPOSITORY, useClass: TypeOrmTripsRepository },
    ListTripsUseCase,
    GetTripUseCase,
    CreateTripUseCase,
    ReplaceTripUseCase,
    DeleteTripUseCase,
    SearchTripsUseCase,
    PatchTripUseCase,
  ],
  exports: [TypeOrmModule, TRIPS_REPOSITORY],
})
export class TripsModule {}
