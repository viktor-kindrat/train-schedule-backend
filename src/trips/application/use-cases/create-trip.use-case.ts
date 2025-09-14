import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  TRIPS_REPOSITORY,
  TripCreateOrReplaceInput,
  TripsRepository,
} from '../../domain/repositories/trips.repository';
import {
  STATIONS_REPOSITORY,
  StationsRepository,
} from '../../../stations/domain/repositories/stations.repository';
import {
  validateTrip,
  TripValidationError,
} from '../../domain/services/validation.service';
import type {
  DayOfWeek,
  StopTimeItem,
} from '../../domain/entities/trip.aggregate';

@Injectable()
export class CreateTripUseCase {
  constructor(
    @Inject(TRIPS_REPOSITORY) private readonly trips: TripsRepository,
    @Inject(STATIONS_REPOSITORY) private readonly stations: StationsRepository,
  ) {}

  private async mapStopsToIds(
    stops: Array<{
      stationCode: string;
      arrival: string | null;
      departure: string | null;
      platform?: string | null;
    }>,
  ) {
    const mapped: TripCreateOrReplaceInput['stops'] = [];
    for (let i = 0; i < stops.length; i++) {
      const st = stops[i];
      const station = await this.stations.findByCode(st.stationCode);
      if (!station)
        throw new BadRequestException(`Unknown stationCode: ${st.stationCode}`);
      mapped.push({
        stationId: station.id,
        seq: i + 1,
        arrival: st.arrival ?? null,
        departure: st.departure ?? null,
        platform: st.platform ?? null,
      });
    }
    return mapped;
  }

  async execute(input: {
    trainNo?: string | null;
    days: number[];
    startDate: string;
    endDate: string;
    stops: Array<{
      stationCode: string;
      arrival?: string | null;
      departure?: string | null;
      platform?: string | null;
    }>;
  }): Promise<number> {
    // normalize stops: add seq and coalesce undefined to null
    const normalizedStops = input.stops.map((s, i) => ({
      stationCode: s.stationCode,
      seq: i + 1,
      arrival: s.arrival ?? null,
      departure: s.departure ?? null,
      platform: s.platform ?? null,
    }));

    try {
      validateTrip({
        trainNo: input.trainNo ?? null,
        days: input.days as DayOfWeek[],
        startDate: input.startDate,
        endDate: input.endDate,
        stops: normalizedStops as StopTimeItem[],
      });
    } catch (e) {
      if (e instanceof TripValidationError)
        throw new BadRequestException(e.message);
      throw e;
    }

    const stops = await this.mapStopsToIds(normalizedStops);
    const tripId = await this.trips.createTrip({
      trainNo: input.trainNo ?? null,
      days: [...input.days],
      startDate: input.startDate,
      endDate: input.endDate,
      stops,
    });
    return tripId;
  }
}
