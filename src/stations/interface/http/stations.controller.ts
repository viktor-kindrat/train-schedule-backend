import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/interface/security/guards/jwt-auth.guard';
import { Roles } from '../../../auth/interface/security/decorators/roles.decorator';
import { Role } from '../../../users/domain/aggregates/user.aggregate';
import { CreateStationUseCase } from '../../application/use-cases/create-station.use-case';
import { ListStationsUseCase } from '../../application/use-cases/list-stations.use-case';
import { DeleteStationUseCase } from '../../application/use-cases/delete-station.use-case';
import { CreateStationDto } from './dto/create-station.dto';
import { RolesGuard } from '../../../auth/interface/security/guards/roles.guard';

@Controller('stations')
export class StationsController {
  constructor(
    private readonly createStation: CreateStationUseCase,
    private readonly listStations: ListStationsUseCase,
    private readonly deleteStation: DeleteStationUseCase,
  ) {}

  @Get()
  async list() {
    return this.listStations.execute();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  async create(@Body() dto: CreateStationDto) {
    try {
      return await this.createStation.execute(dto);
    } catch (e) {
      if ((e as Error).message.includes('already exists')) {
        throw new BadRequestException('Station code already exists');
      }
      throw e;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.deleteStation.execute(id);
      return { success: true };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      if (e instanceof BadRequestException) throw e;
      throw e;
    }
  }
}
