import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trip } from './trip.orm-entity';
import { Station } from '../../../../stations/infrastructure/persistence/typeorm/station.orm-entity';

@Entity('stop_times')
@Index(['tripId', 'seq'], { unique: true })
@Index(['tripId', 'stationId'])
export class StopTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tripId: number;

  @Column()
  stationId: number;

  @ManyToOne(() => Trip, (t) => t.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => Station, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @Column({ type: 'int' })
  seq: number;

  @Column({ type: 'varchar', length: 5, nullable: true })
  arrival: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  departure: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform: string | null;
}
