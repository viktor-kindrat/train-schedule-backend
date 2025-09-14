import { StationSnapshot } from '../entities/station.entity';

export const STATIONS_REPOSITORY = Symbol('STATIONS_REPOSITORY');

export type CreateStationParams = { code: string; name: string };

export interface StationsRepository {
  create(params: CreateStationParams): Promise<StationSnapshot>;
  findById(id: number): Promise<StationSnapshot | null>;
  findByCode(code: string): Promise<StationSnapshot | null>;
  list(): Promise<StationSnapshot[]>;
  delete(id: number): Promise<void>;
  countUsageInStopTimes(stationId: number): Promise<number>;
}

export type SafeStationDTO = StationSnapshot;
