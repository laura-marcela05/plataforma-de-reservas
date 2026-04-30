import { IsString } from 'class-validator';

export class CreateMembresiaDto {
  @IsString()
  tipo: string;
}
