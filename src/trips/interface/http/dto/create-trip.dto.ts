import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StopDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  stationCode!: string;

  @IsInt()
  @IsOptional()
  seq?: number;

  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'arrival must be HH:mm' })
  arrival?: string | null;

  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'departure must be HH:mm',
  })
  departure?: string | null;

  @IsOptional()
  @IsString()
  platform?: string | null;
}

export class CreateOrReplaceTripDto {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  trainNo?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn([1, 2, 3, 4, 5, 6, 7], { each: true })
  days!: number[];

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops!: StopDto[];
}
