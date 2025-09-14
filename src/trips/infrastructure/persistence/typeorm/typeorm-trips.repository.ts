import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { Trip } from './trip.orm-entity';
import { StopTime } from './trip_stop_time.orm-entity';
import {
  ListTripsQuery,
  PagedResult,
  SearchDeparturesParams,
  SearchDeparturesResultItem,
  TripCreateOrReplaceInput,
  TripListItemCompact,
  TripListItemFull,
  TripsRepository,
} from '../../../domain/repositories/trips.repository';
import {
  DayOfWeek,
  TripSnapshot,
} from '../../../domain/entities/trip.aggregate';

export class TypeOrmTripsRepository implements TripsRepository {
  constructor(
    @InjectRepository(Trip)
    private readonly trips: Repository<Trip>,
    @InjectRepository(StopTime)
    private readonly stops: Repository<StopTime>,
    private readonly dataSource: DataSource,
  ) {}

  async findByIdWithStops(id: number): Promise<TripSnapshot | null> {
    const trip = await this.trips.findOne({ where: { id } });
    if (!trip) return null;

    const stopRows = await this.stops
      .createQueryBuilder('st')
      .leftJoin('st.station', 'station')
      .where('st.tripId = :id', { id })
      .orderBy('st.seq', 'ASC')
      .select([
        'st.seq AS seq',
        'st.arrival AS arrival',
        'st.departure AS departure',
        'st.platform AS platform',
        'station.code AS code',
      ])
      .getRawMany<{
        seq: number;
        arrival: string | null;
        departure: string | null;
        platform: string | null;
        code: string;
      }>();

    const stops = stopRows.map((r) => ({
      stationCode: r.code,
      seq: Number(r.seq),
      arrival: r.arrival,
      departure: r.departure,
      platform: r.platform,
    }));

    return {
      id: trip.id,
      trainNo: trip.trainNo ?? null,
      days: trip.days as DayOfWeek[],
      startDate: trip.startDate,
      endDate: trip.endDate,
      stops,
    };
  }

  async list(
    query: ListTripsQuery,
  ): Promise<PagedResult<TripListItemFull | TripListItemCompact>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));

    const qb = this.trips.createQueryBuilder('t');

    if (query.trainNo) {
      qb.andWhere('t.trainNo ILIKE :trainNo', {
        trainNo: `%${query.trainNo}%`,
      });
    }

    if (query.stationCode) {
      qb.innerJoin(StopTime, 'st', 'st.tripId = t.id')
        .innerJoin('st.station', 's')
        .andWhere('s.code = :code', {
          code: query.stationCode.trim().toLowerCase(),
        });
    }

    if (query.activeOnDate) {
      const dow = (() => {
        const d = dayjs(query.activeOnDate);
        const w = d.day();
        return w + 1;
      })();
      qb.andWhere('t.startDate <= :date AND t.endDate >= :date', {
        date: query.activeOnDate,
      });
      qb.andWhere(':dow = ANY(t.days)', { dow });
    }

    if (query.sort === 'firstDeparture') {
      qb.leftJoin(StopTime, 'fst', 'fst.tripId = t.id AND fst.seq = 1').orderBy(
        'fst.departure',
        'ASC',
        'NULLS LAST',
      );
    } else {
      qb.orderBy('t.trainNo', 'ASC', 'NULLS LAST');
    }

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    if (query.details) {
      const result: TripListItemFull[] = [];
      for (const t of items) {
        const full = await this.findByIdWithStops(t.id);
        if (full) {
          result.push({ ...full, stopsCount: full.stops.length });
        }
      }
      return { items: result, total, page, pageSize };
    }

    // compact mode: get counts for current page items
    const ids = items.map((t) => t.id);
    let countsMap = new Map<number, number>();
    if (ids.length > 0) {
      const rows = await this.stops
        .createQueryBuilder('st')
        .select('st.tripId', 'tripId')
        .addSelect('COUNT(*)', 'cnt')
        .where('st.tripId IN (:...ids)', { ids })
        .groupBy('st.tripId')
        .getRawMany<{ tripId: number; cnt: string }>();
      countsMap = new Map(rows.map((r) => [Number(r.tripId), Number(r.cnt)]));
    }

    const compact: TripListItemCompact[] = items.map((t) => ({
      id: t.id,
      trainNo: t.trainNo ?? null,
      days: t.days as DayOfWeek[],
      startDate: t.startDate,
      endDate: t.endDate,
      stopsCount: countsMap.get(t.id) ?? 0,
    }));

    return { items: compact, total, page, pageSize };
  }

  async searchDepartures(
    params: SearchDeparturesParams,
  ): Promise<SearchDeparturesResultItem[]> {
    const qb = this.trips
      .createQueryBuilder('t')
      .innerJoin(StopTime, 'a', 'a.tripId = t.id AND a.stationId = :fromId', {
        fromId: params.fromStationId,
      })
      .innerJoin(
        StopTime,
        'b',
        'b.tripId = t.id AND b.stationId = :toId AND b.seq > a.seq',
        { toId: params.toStationId },
      )
      .innerJoin('a.station', 'sa')
      .innerJoin('b.station', 'sb')
      .andWhere('t.startDate <= :date AND t.endDate >= :date', {
        date: params.date,
      })
      .andWhere(':dow = ANY(t.days)', {
        dow: ((w) => w + 1)(dayjs(params.date).day()),
      })
      .andWhere('a.departure >= :time', { time: params.time })
      .orderBy('a.departure', 'ASC')
      .limit(params.limit)
      .select([
        't.id AS trip_id',
        't.trainNo AS train_no',
        'a.departure AS dep',
        'b.arrival AS arr',
        'sa.code AS from_code',
        'sb.code AS to_code',
        'a.stationId AS from_id',
        'b.stationId AS to_id',
      ]);

    const rows = await qb.getRawMany<{
      trip_id: number;
      train_no: string | null;
      dep: string;
      arr: string;
      from_code: string;
      to_code: string;
      from_id: number;
      to_id: number;
    }>();

    return rows.map((r) => ({
      tripId: Number(r.trip_id),
      trainNo: r.train_no ?? null,
      from: {
        stationId: Number(r.from_id),
        stationCode: r.from_code,
        departure: r.dep,
      },
      to: {
        stationId: Number(r.to_id),
        stationCode: r.to_code,
        arrival: r.arr,
      },
      durationMinutes: diffMinutes(r.dep, r.arr),
    }));
  }

  async createTrip(input: TripCreateOrReplaceInput): Promise<number> {
    return await this.dataSource.transaction(async (manager) => {
      const tRepo = manager.getRepository(Trip);
      const sRepo = manager.getRepository(StopTime);

      const t = tRepo.create({
        trainNo: input.trainNo ?? null,
        days: input.days,
        startDate: input.startDate,
        endDate: input.endDate,
      });
      const saved = await tRepo.save(t);
      const stopEntities = input.stops.map((s) =>
        sRepo.create({
          tripId: saved.id,
          stationId: s.stationId,
          seq: s.seq,
          arrival: s.arrival ?? null,
          departure: s.departure ?? null,
          platform: s.platform ?? null,
        }),
      );
      await sRepo.save(stopEntities);
      return saved.id;
    });
  }

  async replaceTrip(
    id: number,
    input: TripCreateOrReplaceInput,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const tRepo = manager.getRepository(Trip);
      const sRepo = manager.getRepository(StopTime);

      const existing = await tRepo.findOne({ where: { id } });
      if (!existing) throw new Error('Trip not found');

      existing.trainNo = input.trainNo ?? null;
      existing.days = input.days;
      existing.startDate = input.startDate;
      existing.endDate = input.endDate;
      await tRepo.save(existing);

      await sRepo.delete({ tripId: id });

      const stopEntities = input.stops.map((s) =>
        sRepo.create({
          tripId: id,
          stationId: s.stationId,
          seq: s.seq,
          arrival: s.arrival ?? null,
          departure: s.departure ?? null,
          platform: s.platform ?? null,
        }),
      );
      await sRepo.save(stopEntities);
    });
  }

  async deleteTrip(id: number): Promise<void> {
    await this.trips.delete({ id });
  }
}

function diffMinutes(dep: string, arr: string) {
  const [dh, dm] = dep.split(':').map((x) => parseInt(x, 10));
  const [ah, am] = arr.split(':').map((x) => parseInt(x, 10));
  return ah * 60 + am - (dh * 60 + dm);
}
