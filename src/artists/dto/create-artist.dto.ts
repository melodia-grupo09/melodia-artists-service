import { IsString, IsOptional } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  name: string;

  @IsOptional()
  image?: any;
}
