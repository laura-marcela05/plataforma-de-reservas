import { IsInt, IsString } from "class-validator";
import { Transform } from "class-transformer";

// DTO para crear una reserva.
// Valida los datos que vienen desde el frontend.
export class CreateReservaDto {
  @IsInt()
  // ID del usuario que solicita la reserva.
  usuarioId: number;

  @IsInt()
  // ID del espacio que se quiere reservar.
  espacioId: number;

  @IsString()
  @Transform(({ value }) => {
    // Transforma el string de fecha (YYYY-MM-DD) a Date
    if (!value) return value;
    const fecha = new Date(value);

    // Valida que sea una fecha válida
    if (isNaN(fecha.getTime())) {
      throw new Error("La fecha debe ser válida");
    }

    // Valida que no sea en el pasado (permite hoy)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
      throw new Error(
        "La fecha de la reserva no puede ser en el pasado. Puedes reservar desde hoy.",
      );
    }

    return value; // Retorna el string original para que el service lo maneje
  })
  // Fecha de la reserva en formato YYYY-MM-DD (hoy o futuro).
  fecha: string;

  @IsString()
  // Hora de inicio en formato 'HH:mm'.
  horaInicio: string;

  @IsString()
  // Hora de fin en formato 'HH:mm'.
  horaFin: string;
}
