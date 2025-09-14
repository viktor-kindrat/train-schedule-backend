import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/infrastructure/frameworks/nest/users.module';
import { AuthModule } from './auth/infrastructure/frameworks/nest/auth.module';
import { User } from './users/infrastructure/persistence/typeorm/user.orm-entity';
import { Station } from './stations/infrastructure/persistence/typeorm/station.orm-entity';
import { StationsModule } from './stations/infrastructure/frameworks/nest/stations.module';
import { Trip } from './trips/infrastructure/persistence/typeorm/trip.orm-entity';
import { StopTime } from './trips/infrastructure/persistence/typeorm/trip_stop_time.orm-entity';
import { TripsModule } from './trips/infrastructure/frameworks/nest/trips.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 5 },
      { name: 'long', ttl: 60000, limit: 120 },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize: true,
        schema: 'public',
        entities: [User, Station, Trip, StopTime],
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StationsModule,
    TripsModule,
  ],
  controllers: [AppController],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
