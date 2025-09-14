export class StationCode {
  private constructor(public readonly value: string) {
    const v = value?.trim();
    if (!v) throw new Error('Station code is required');
    if (!/^[A-Za-z0-9_-]+$/.test(v)) {
      throw new Error(
        'Station code must be alphanumeric with dashes/underscores',
      );
    }
  }
  static of(v: string) {
    return new StationCode(v.trim().toLowerCase());
  }
}

export class StationEntity {
  private constructor(
    private readonly _id: number,
    private _code: StationCode,
    private _name: string,
  ) {}

  static createNew(params: { id: number; code: string; name: string }) {
    if (!params.name?.trim()) throw new Error('Station name is required');
    return new StationEntity(
      params.id,
      StationCode.of(params.code),
      params.name.trim(),
    );
  }

  static restore(snapshot: StationSnapshot) {
    return new StationEntity(
      snapshot.id,
      StationCode.of(snapshot.code),
      snapshot.name,
    );
  }

  snapshot(): StationSnapshot {
    return { id: this._id, code: this._code.value, name: this._name };
  }
}

export type StationSnapshot = { id: number; code: string; name: string };
