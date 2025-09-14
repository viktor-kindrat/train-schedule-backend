import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/infrastructure/persistence/typeorm/user.orm-entity';
import { Station } from '../stations/infrastructure/persistence/typeorm/station.orm-entity';
import { Trip } from '../trips/infrastructure/persistence/typeorm/trip.orm-entity';
import { StopTime } from '../trips/infrastructure/persistence/typeorm/trip_stop_time.orm-entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  schema: process.env.DB_SCHEMA || 'public',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  entities: [User, Station, Trip, StopTime],
});
