import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ListTripsUseCase } from '../../application/use-cases/list-trips.use-case';
import { GetTripUseCase } from '../../application/use-cases/get-trip.use-case';
import { CreateTripUseCase } from '../../application/use-cases/create-trip.use-case';
import { ReplaceTripUseCase } from '../../application/use-cases/replace-trip.use-case';
import { DeleteTripUseCase } from '../../application/use-cases/delete-trip.use-case';
import { SearchTripsUseCase } from '../../application/use-cases/search-trips.use-case';
import { PatchTripUseCase } from '../../application/use-cases/patch-trip.use-case';
import { CreateOrReplaceTripDto } from './dto/create-trip.dto';
import { ListTripsQueryDto } from './dto/list-trips.query';
import { SearchTripsQueryDto } from './dto/search-trips.query';
import { PatchTripDto } from './dto/patch-trip.dto';
import { JwtAuthGuard } from '../../../auth/interface/security/guards/jwt-auth.guard';
import { Roles } from '../../../auth/interface/security/decorators/roles.decorator';
import { Role } from '../../../users/domain/aggregates/user.aggregate';
import { RolesGuard } from '../../../auth/interface/security/guards/roles.guard';
import type {
  PatchTripCommand,
  TripListItemCompact,
  TripListItemFull,
} from '../../domain/repositories/trips.repository';

@Controller('trips')
export class TripsController {
  constructor(
    private readonly listTrips: ListTripsUseCase,
    private readonly getTrip: GetTripUseCase,
    private readonly createTrip: CreateTripUseCase,
    private readonly replaceTrip: ReplaceTripUseCase,
    private readonly deleteTrip: DeleteTripUseCase,
    private readonly searchTrips: SearchTripsUseCase,
    private readonly patchTrip: PatchTripUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListTripsQueryDto) {
    const res = await this.listTrips.execute(query);
    const isFull = (
      item: TripListItemFull | TripListItemCompact,
    ): item is TripListItemFull =>
      (item as TripListItemFull).stops !== undefined;

    const mappedItems = res.items.map((it) =>
      isFull(it) ? { ...it, stations: it.stops } : { ...it, stations: [] },
    );
    return { ...res, items: mappedItems };
  }

  @Get('search')
  async search(@Query() query: SearchTripsQueryDto) {
    return this.searchTrips.execute(query);
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.getTrip.execute(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  async create(@Body() dto: CreateOrReplaceTripDto) {
    const id = await this.createTrip.execute(dto);
    return { id };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOrReplaceTripDto,
  ) {
    await this.replaceTrip.execute(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PatchTripDto,
  ) {
    let cmd: PatchTripCommand;
    switch (dto.op) {
      case 'updateCalendar':
        cmd = {
          op: 'updateCalendar',
          ...(dto.trainNo !== undefined ? { trainNo: dto.trainNo } : {}),
          ...(dto.days !== undefined ? { days: dto.days } : {}),
          ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
          ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
        };
        break;
      case 'addStop':
        cmd = {
          op: 'addStop',
          afterSeq: dto.afterSeq!,
          stationCode: dto.stationCode!,
          ...(dto.arrival !== undefined ? { arrival: dto.arrival } : {}),
          ...(dto.departure !== undefined ? { departure: dto.departure } : {}),
          ...(dto.platform !== undefined ? { platform: dto.platform } : {}),
        };
        break;
      case 'removeStop':
        cmd = { op: 'removeStop', seq: dto.seq! };
        break;
      case 'moveStop':
        cmd = { op: 'moveStop', fromSeq: dto.fromSeq!, toSeq: dto.toSeq! };
        break;
      case 'updateStop':
        cmd = {
          op: 'updateStop',
          targetSeq: dto.targetSeq!,
          ...(dto.newArrival !== undefined
            ? { newArrival: dto.newArrival }
            : {}),
          ...(dto.newDeparture !== undefined
            ? { newDeparture: dto.newDeparture }
            : {}),
          ...(dto.newPlatform !== undefined
            ? { newPlatform: dto.newPlatform }
            : {}),
        };
        break;
      default:
        // exhaustive check
        throw new BadRequestException('Unsupported op');
    }
    return this.patchTrip.execute(id, cmd);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.deleteTrip.execute(id);
  }
}
