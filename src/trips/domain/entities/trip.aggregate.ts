export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type StopTimeItem = {
  stationCode: string;
  seq: number;
  arrival: string | null;
  departure: string | null;
  platform?: string | null;
};

export type TripSnapshot = {
  id: number;
  trainNo: string | null;
  days: DayOfWeek[];
  startDate: string;
  endDate: string;
  stops: StopTimeItem[];
};

export class TripAggregate {
  private constructor(private readonly _snapshot: TripSnapshot) {}

  static restore(snapshot: TripSnapshot) {
    return new TripAggregate(snapshot);
  }

  snapshot(): TripSnapshot {
    return this._snapshot;
  }
}
