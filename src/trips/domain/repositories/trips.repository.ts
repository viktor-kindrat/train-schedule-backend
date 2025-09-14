import { TripSnapshot } from '../entities/trip.aggregate';

export const TRIPS_REPOSITORY = Symbol('TRIPS_REPOSITORY');

export type ListTripsQuery = {
  page?: number;
  pageSize?: number;
  details?: boolean;
  trainNo?: string;
  stationCode?: string;
  activeOnDate?: string;
  sort?: 'trainNo';
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type TripCreateOrReplaceInput = {
  trainNo?: string | null;
  days: number[];
  startDate: string;
  endDate: string;
  stops: Array<{
    stationId: number;
    seq: number;
    arrival: string | null;
    departure: string | null;
    platform?: string | null;
  }>;
};

export type SearchDeparturesParams = {
  fromStationId: number;
  toStationId: number;
  date: string;
  time: string;
  limit: number;
};

export type SearchDeparturesResultItem = {
  tripId: number;
  trainNo: string | null;
  from: { stationId: number; stationCode: string; departure: string };
  to: { stationId: number; stationCode: string; arrival: string };
  durationMinutes: number;
};

export type PatchTripCommand =
  | {
      op: 'updateCalendar';
      trainNo?: string | null;
      days?: number[];
      startDate?: string;
      endDate?: string;
    }
  | {
      op: 'addStop';
      afterSeq: number;
      stationCode: string;
      arrival?: string | null;
      departure?: string | null;
      platform?: string | null;
    }
  | { op: 'removeStop'; seq: number }
  | { op: 'moveStop'; fromSeq: number; toSeq: number }
  | {
      op: 'updateStop';
      targetSeq: number;
      newArrival?: string | null;
      newDeparture?: string | null;
      newPlatform?: string | null;
    };

export type TripListItemCompact = Omit<TripSnapshot, 'stops'> & {
  stopsCount: number;
};
export type TripListItemFull = TripSnapshot & { stopsCount: number };

export interface TripsRepository {
  findByIdWithStops(id: number): Promise<TripSnapshot | null>;
  list(
    query: ListTripsQuery,
  ): Promise<PagedResult<TripListItemFull | TripListItemCompact>>;
  searchDepartures(
    params: SearchDeparturesParams,
  ): Promise<SearchDeparturesResultItem[]>;
  createTrip(input: TripCreateOrReplaceInput): Promise<number>;
  replaceTrip(id: number, input: TripCreateOrReplaceInput): Promise<void>;
  deleteTrip(id: number): Promise<void>;
}
