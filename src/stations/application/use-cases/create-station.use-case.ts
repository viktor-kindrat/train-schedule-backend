import { Inject, Injectable } from '@nestjs/common';
import {
  CreateStationParams,
  STATIONS_REPOSITORY,
  StationsRepository,
} from '../../domain/repositories/stations.repository';

@Injectable()
export class CreateStationUseCase {
  constructor(
    @Inject(STATIONS_REPOSITORY)
    private readonly repo: StationsRepository,
  ) {}

  async execute(params: CreateStationParams) {
    // ensure unique code (case-insensitive)
    const existing = await this.repo.findByCode(params.code);
    if (existing) {
      throw new Error('Station code already exists');
    }
    return this.repo.create(params);
  }
}
