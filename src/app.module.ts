import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {APP_GUARD} from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ThrottlerModule.forRoot([
            {name: 'short', ttl: 1000, limit: 5},
            {name: 'long', ttl: 60000, limit: 120},
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
                entities: [],
                ssl: {rejectUnauthorized: false},
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AppController],

    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {
}
