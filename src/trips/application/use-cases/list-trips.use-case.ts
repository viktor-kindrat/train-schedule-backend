import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  ListTripsQuery,
  TRIPS_REPOSITORY,
  TripsRepository,
} from '../../domain/repositories/trips.repository';
import { isValidDate } from '../../domain/services/validation.service';

@Injectable()
export class ListTripsUseCase {
  constructor(
    @Inject(TRIPS_REPOSITORY) private readonly trips: TripsRepository,
  ) {}

  async execute(query: ListTripsQuery) {
    if (query.activeOnDate && !isValidDate(query.activeOnDate)) {
      throw new BadRequestException('Invalid date format');
    }
    if (query.pageSize && query.pageSize > 100) {
      throw new BadRequestException('pageSize too large');
    }
    return this.trips.list(query);
  }
}
