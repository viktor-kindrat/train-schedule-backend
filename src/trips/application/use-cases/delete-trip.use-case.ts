import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TRIPS_REPOSITORY,
  TripsRepository,
} from '../../domain/repositories/trips.repository';

@Injectable()
export class DeleteTripUseCase {
  constructor(
    @Inject(TRIPS_REPOSITORY) private readonly trips: TripsRepository,
  ) {}

  async execute(id: number) {
    const existing = await this.trips.findByIdWithStops(id);
    if (!existing) throw new NotFoundException('Trip not found');
    await this.trips.deleteTrip(id);
  }
}
