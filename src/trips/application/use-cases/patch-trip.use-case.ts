import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TRIPS_REPOSITORY,
  TripCreateOrReplaceInput,
  TripsRepository,
  PatchTripCommand,
} from '../../domain/repositories/trips.repository';
import {
  STATIONS_REPOSITORY,
  StationsRepository,
} from '../../../stations/domain/repositories/stations.repository';
import {
  TripSnapshot,
  StopTimeItem,
} from '../../domain/entities/trip.aggregate';
import type { DayOfWeek } from '../../domain/entities/trip.aggregate';
import {
  TripValidationError,
  validateTrip,
} from '../../domain/services/validation.service';

@Injectable()
export class PatchTripUseCase {
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

  async execute(id: number, patch: PatchTripCommand) {
    const current = await this.trips.findByIdWithStops(id);
    if (!current) throw new NotFoundException('Trip not found');

    const snapshot: TripSnapshot = {
      ...current,
      stops: current.stops.map((s) => ({ ...s })),
    };

    switch (patch.op) {
      case 'updateCalendar': {
        if (patch.trainNo !== undefined) snapshot.trainNo = patch.trainNo;
        if (patch.days) snapshot.days = patch.days.map((d) => d as DayOfWeek);
        if (patch.startDate) snapshot.startDate = patch.startDate;
        if (patch.endDate) snapshot.endDate = patch.endDate;
        break;
      }
      case 'updateStop': {
        const idx = snapshot.stops.findIndex((s) => s.seq === patch.targetSeq);
        if (idx === -1) throw new BadRequestException('targetSeq not found');
        const s = snapshot.stops[idx];
        if (patch.newArrival !== undefined) s.arrival = patch.newArrival;
        if (patch.newDeparture !== undefined) s.departure = patch.newDeparture;
        if (patch.newPlatform !== undefined) s.platform = patch.newPlatform;
        break;
      }
      case 'removeStop': {
        if (snapshot.stops.length <= 2)
          throw new BadRequestException(
            'cannot remove: at least 2 stops required',
          );
        const idx = snapshot.stops.findIndex((s) => s.seq === patch.seq);
        if (idx === -1) throw new BadRequestException('seq not found');
        snapshot.stops.splice(idx, 1);
        snapshot.stops.forEach((s, i) => (s.seq = i + 1));
        break;
      }
      case 'addStop': {
        const after = patch.afterSeq ?? 0;
        if (after < 0 || after > snapshot.stops.length - 1)
          throw new BadRequestException('afterSeq out of range');
        if (!patch.stationCode)
          throw new BadRequestException('stationCode required');
        const newStop: StopTimeItem = {
          stationCode: String(patch.stationCode),
          seq: 0,
          arrival: patch.arrival ?? null,
          departure: patch.departure ?? null,
          platform: patch.platform ?? null,
        };
        const insertIndex = after;
        snapshot.stops.splice(insertIndex + 1, 0, newStop);
        snapshot.stops.forEach((s, i) => (s.seq = i + 1));
        break;
      }
      case 'moveStop': {
        const fromIdx = snapshot.stops.findIndex(
          (s) => s.seq === patch.fromSeq,
        );
        const toIdx0 = snapshot.stops.findIndex((s) => s.seq === patch.toSeq);
        if (fromIdx === -1 || toIdx0 === -1)
          throw new BadRequestException('fromSeq/toSeq not found');
        const [item] = snapshot.stops.splice(fromIdx, 1);
        const toIdxAfterRemoval = snapshot.stops.findIndex(
          (s) => s.seq === patch.toSeq,
        );
        snapshot.stops.splice(toIdxAfterRemoval, 0, item);
        snapshot.stops.forEach((s, i) => (s.seq = i + 1));
        break;
      }
      default:
        throw new BadRequestException('Unsupported op');
    }

    try {
      validateTrip({ ...snapshot, id: undefined });
    } catch (e) {
      if (e instanceof TripValidationError)
        throw new BadRequestException(e.message);
      throw e;
    }

    const mappedStops = await this.mapStopsToIds(snapshot.stops);
    await this.trips.replaceTrip(id, {
      trainNo: snapshot.trainNo ?? null,
      days: [...snapshot.days],
      startDate: snapshot.startDate,
      endDate: snapshot.endDate,
      stops: mappedStops,
    });

    return await this.trips.findByIdWithStops(id);
  }
}
