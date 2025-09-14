import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  STATIONS_REPOSITORY,
  StationsRepository,
} from '../../../stations/domain/repositories/stations.repository';
import {
  TRIPS_REPOSITORY,
  TripsRepository,
} from '../../domain/repositories/trips.repository';
import {
  isValidDate,
  isValidTime,
} from '../../domain/services/validation.service';

@Injectable()
export class SearchTripsUseCase {
  constructor(
    @Inject(TRIPS_REPOSITORY) private readonly trips: TripsRepository,
    @Inject(STATIONS_REPOSITORY) private readonly stations: StationsRepository,
  ) {}

  async execute(params: {
    from: string;
    to: string;
    date: string;
    time: string;
    limit?: number;
  }) {
    if (params.from.trim().toLowerCase() === params.to.trim().toLowerCase()) {
      throw new BadRequestException('from and to must be different');
    }
    if (!isValidDate(params.date))
      throw new BadRequestException('Invalid date format');
    if (!isValidTime(params.time))
      throw new BadRequestException('Invalid time format');

    const fromS = await this.stations.findByCode(params.from);
    const toS = await this.stations.findByCode(params.to);
    if (!fromS || !toS) throw new BadRequestException('Unknown station(s)');

    const limit = Math.min(200, Math.max(1, params.limit ?? 50));

    return this.trips.searchDepartures({
      fromStationId: fromS.id,
      toStationId: toS.id,
      date: params.date,
      time: params.time,
      limit,
    });
  }
}
