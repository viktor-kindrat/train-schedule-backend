import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TRIPS_REPOSITORY,
  TripsRepository,
} from '../../domain/repositories/trips.repository';

@Injectable()
export class GetTripUseCase {
  constructor(
    @Inject(TRIPS_REPOSITORY) private readonly trips: TripsRepository,
  ) {}

  async execute(id: number) {
    const trip = await this.trips.findByIdWithStops(id);
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }
}
