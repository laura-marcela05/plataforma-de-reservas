import { IsString, IsInt, Min, Matches } from 'class-validator';

export class CreateSedeDto {
  @IsString()
  nombre: string;

  @IsString()
  direccion: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'horarioApertura debe tener formato 24h HH:mm (ej: 08:00)',
  })
  horarioApertura: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'horarioCierre debe tener formato 24h HH:mm (ej: 20:00)',
  })
  horarioCierre: string;

  @IsInt()
  @Min(1, { message: 'La capacidadTotal debe ser mayor a 0' })
  capacidadTotal: number;
}
