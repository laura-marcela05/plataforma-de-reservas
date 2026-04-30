import { IsString } from 'class-validator';

export class CreateTipoEspacioDto {
  @IsString()
  nombre: string;
}
