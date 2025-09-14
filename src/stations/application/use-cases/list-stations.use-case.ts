import { Inject, Injectable } from '@nestjs/common';
import {
  STATIONS_REPOSITORY,
  StationsRepository,
} from '../../domain/repositories/stations.repository';

@Injectable()
export class ListStationsUseCase {
  constructor(
    @Inject(STATIONS_REPOSITORY)
    private readonly repo: StationsRepository,
  ) {}

  async execute() {
    return this.repo.list();
  }
}
