import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Station } from './station.orm-entity';
import {
  CreateStationParams,
  StationsRepository,
} from '../../../domain/repositories/stations.repository';
import { StationEntity } from '../../../domain/entities/station.entity';
import { StopTime } from '../../../../trips/infrastructure/persistence/typeorm/trip_stop_time.orm-entity';

export class TypeOrmStationsRepository implements StationsRepository {
  constructor(
    @InjectRepository(Station)
    private readonly repo: Repository<Station>,
    private readonly dataSource: DataSource,
  ) {}

  async create(params: CreateStationParams) {
    const code = params.code.trim().toLowerCase();
    const name = params.name.trim();
    const entity = this.repo.create({ code, name });
    const saved = await this.repo.save(entity);
    return StationEntity.createNew({
      id: saved.id,
      code: saved.code,
      name: saved.name,
    }).snapshot();
  }

  async findById(id: number) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) return null;
    return StationEntity.restore({
      id: s.id,
      code: s.code,
      name: s.name,
    }).snapshot();
  }

  async findByCode(code: string) {
    const s = await this.repo.findOne({
      where: { code: code.trim().toLowerCase() },
    });
    if (!s) return null;
    return StationEntity.restore({
      id: s.id,
      code: s.code,
      name: s.name,
    }).snapshot();
  }

  async list() {
    const rows = await this.repo.find({ order: { code: 'ASC' } });
    return rows.map((s) =>
      StationEntity.restore({
        id: s.id,
        code: s.code,
        name: s.name,
      }).snapshot(),
    );
  }

  async delete(id: number) {
    await this.repo.delete({ id });
  }

  async countUsageInStopTimes(stationId: number): Promise<number> {
    const stopRepo = this.dataSource.getRepository(StopTime);
    return await stopRepo.count({ where: { stationId } });
  }
}
