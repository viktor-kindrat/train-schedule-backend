import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  STATIONS_REPOSITORY,
  StationsRepository,
} from '../../domain/repositories/stations.repository';

@Injectable()
export class DeleteStationUseCase {
  constructor(
    @Inject(STATIONS_REPOSITORY)
    private readonly repo: StationsRepository,
  ) {}

  async execute(id: number) {
    const station = await this.repo.findById(id);
    if (!station) throw new NotFoundException('Station not found');
    const usage = await this.repo.countUsageInStopTimes(id);
    if (usage > 0) {
      throw new BadRequestException(
        'Cannot delete station: it is used in stop times',
      );
    }
    await this.repo.delete(id);
  }
}
