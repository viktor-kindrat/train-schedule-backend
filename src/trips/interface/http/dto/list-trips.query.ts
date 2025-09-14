import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListTripsQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @Transform(({ value }) => String(value) === 'true' || value === true)
  @IsBoolean()
  details?: boolean = false;

  @IsOptional()
  @IsString()
  trainNo?: string;

  @IsOptional()
  @IsString()
  stationCode?: string;

  @IsOptional()
  @IsString()
  activeOnDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsIn(['trainNo', 'firstDeparture'])
  sort?: 'trainNo' | 'firstDeparture';
}
