import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateStationDto {
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9_-]+$/)
  code: string;

  @IsNotEmpty()
  @MaxLength(200)
  name: string;
}
