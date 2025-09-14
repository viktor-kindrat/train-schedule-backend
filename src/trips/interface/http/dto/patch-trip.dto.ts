import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class PatchTripDto {
  @IsString()
  @IsIn(['updateCalendar', 'addStop', 'removeStop', 'moveStop', 'updateStop'])
  op!: 'updateCalendar' | 'addStop' | 'removeStop' | 'moveStop' | 'updateStop';

  @ValidateIf((o: PatchTripDto) => o.op === 'updateCalendar')
  @IsOptional()
  @IsString()
  trainNo?: string | null;

  @ValidateIf((o: PatchTripDto) => o.op === 'updateCalendar')
  @IsOptional()
  @IsArray()
  days?: number[];

  @ValidateIf((o: PatchTripDto) => o.op === 'updateCalendar')
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ValidateIf((o: PatchTripDto) => o.op === 'updateCalendar')
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ValidateIf((o: PatchTripDto) => o.op === 'addStop')
  @IsInt()
  afterSeq?: number;

  @ValidateIf((o: PatchTripDto) => o.op === 'addStop')
  @IsString()
  @IsNotEmpty()
  stationCode?: string;

  @ValidateIf((o: PatchTripDto) => o.op === 'addStop')
  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  arrival?: string | null;

  @ValidateIf((o: PatchTripDto) => o.op === 'addStop')
  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  departure?: string | null;

  @ValidateIf((o: PatchTripDto) => o.op === 'addStop')
  @IsOptional()
  @IsString()
  platform?: string | null;

  @ValidateIf((o: PatchTripDto) => o.op === 'removeStop')
  @IsInt()
  seq?: number;

  @ValidateIf((o: PatchTripDto) => o.op === 'moveStop')
  @IsInt()
  fromSeq?: number;

  @ValidateIf((o: PatchTripDto) => o.op === 'moveStop')
  @IsInt()
  toSeq?: number;

  @ValidateIf((o: PatchTripDto) => o.op === 'updateStop')
  @IsInt()
  targetSeq?: number;

  @ValidateIf((o: PatchTripDto) => o.op === 'updateStop')
  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  newArrival?: string | null;

  @ValidateIf((o: PatchTripDto) => o.op === 'updateStop')
  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  newDeparture?: string | null;

  @ValidateIf((o: PatchTripDto) => o.op === 'updateStop')
  @IsOptional()
  @IsString()
  newPlatform?: string | null;
}
