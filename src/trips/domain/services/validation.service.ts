import {
  DayOfWeek,
  StopTimeItem,
  TripSnapshot,
} from '../entities/trip.aggregate';

export class TripValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isValidTime(time: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}

export function validateDays(days: number[]): asserts days is DayOfWeek[] {
  if (!Array.isArray(days) || days.length === 0)
    throw new TripValidationError('days must be non-empty array');
  const set = new Set<number>();
  for (const d of days) {
    if (!Number.isInteger(d) || d < 1 || d > 7)
      throw new TripValidationError('days must contain 1..7 (1=Mon..7=Sun)');
    if (set.has(d))
      throw new TripValidationError('days must not contain duplicates');
    set.add(d);
  }
}

export function validateStopTimes(stops: StopTimeItem[]): void {
  if (!Array.isArray(stops) || stops.length < 2) {
    throw new TripValidationError('stops must contain at least 2 elements');
  }
  const seqs = stops.map((s) => s.seq);
  for (let i = 0; i < seqs.length; i++) {
    if (seqs[i] !== i + 1)
      throw new TripValidationError('seq must be 1..N contiguous');
  }

  if (!stops[0].departure)
    throw new TripValidationError('first stop must have departure');
  if (!stops[stops.length - 1].arrival)
    throw new TripValidationError('last stop must have arrival');

  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    if (!s.stationCode?.trim())
      throw new TripValidationError(`stop[${i}] stationCode required`);
    if (s.arrival && !isValidTime(s.arrival))
      throw new TripValidationError(`stop[${i}] invalid arrival`);
    if (s.departure && !isValidTime(s.departure))
      throw new TripValidationError(`stop[${i}] invalid departure`);
    if (
      s.arrival &&
      s.departure &&
      timeToMinutes(s.arrival) > timeToMinutes(s.departure)
    ) {
      throw new TripValidationError(`stop[${i}] arrival must be <= departure`);
    }
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    const lastTime = a.departure ?? a.arrival;
    if (!lastTime) throw new TripValidationError(`stop[${i}] has no time`);
    if (!b.arrival)
      throw new TripValidationError(`stop[${i + 1}] arrival required`);
    const last = timeToMinutes(lastTime);
    const arrB = timeToMinutes(b.arrival);
    if (arrB < last)
      throw new TripValidationError(
        `arrival at stop[${i + 1}] must be >= previous time`,
      );
    if (b.departure) {
      const depB = timeToMinutes(b.departure);
      if (depB < arrB)
        throw new TripValidationError(
          `departure at stop[${i + 1}] must be >= arrival`,
        );
    }
  }
}

export function validateTrip(
  snapshot: Omit<TripSnapshot, 'id'> & { id?: number },
) {
  if (!isValidDate(snapshot.startDate) || !isValidDate(snapshot.endDate)) {
    throw new TripValidationError('Invalid date format');
  }
  if (snapshot.startDate > snapshot.endDate) {
    throw new TripValidationError('startDate must be <= endDate');
  }
  validateDays(snapshot.days);
  validateStopTimes(snapshot.stops);
}
