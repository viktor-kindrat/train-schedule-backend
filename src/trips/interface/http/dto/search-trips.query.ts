import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class SearchTripsQueryDto {
  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  time!: string;

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
