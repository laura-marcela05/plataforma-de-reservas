import { IsString, IsInt, Min } from 'class-validator';

export class CreateEspacioDto {
  @IsString()
  nombre: string;

  @IsInt()
  @Min(1, { message: 'La capacidad debe ser mayor a 0' })
  capacidad: number;

  @IsInt()
  sedeId: number;

  @IsInt()
  tipoEspacioId: number;
}
