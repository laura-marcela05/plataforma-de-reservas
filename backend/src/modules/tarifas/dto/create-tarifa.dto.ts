import { IsInt, IsNumber } from 'class-validator';

export class CreateTarifaDto {
  @IsNumber()
  precioHora: number;

  @IsInt()
  tipoEspacioId: number;

  @IsInt()
  membresiaId: number;
}
