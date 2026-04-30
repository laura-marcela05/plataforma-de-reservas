import { Injectable, BadRequestException } from "@nestjs/common";
import { ReservasRepository } from "../repository/reservas.repository";
import { CreateReservaDto } from "../dto/create-reserva.dto";

// Servicio de reservas: aplica reglas de negocio y coordina consultas con el repository.
@Injectable()
export class ReservasService {
  constructor(private readonly repository: ReservasRepository) {}

  // Retorna todas las reservas.
  findAll() {
    return this.repository.findAll();
  }

  // Retorna una reserva específica por ID.
  findOne(id: number) {
    return this.repository.findOne(id);
  }

  // Crea una reserva nueva a partir de los datos del frontend.
  // ✅ Validación: rechaza fechas pasadas Y horas pasadas en hoy
  create(dto: CreateReservaDto) {
    try {
      // ✅ Extraer componentes de la fecha string (YYYY-MM-DD)
      const [year, month, day] = dto.fecha.split("-").map(Number);
      const fechaReserva = new Date(year, month - 1, day);
      const hoy = new Date();

      // Establecer ambas fechas a medianoche para comparar solo días
      hoy.setHours(0, 0, 0, 0);
      fechaReserva.setHours(0, 0, 0, 0);

      // Si la fecha es MENOR a hoy, rechaza
      if (fechaReserva < hoy) {
        throw new BadRequestException(
          "La fecha de la reserva no puede ser en el pasado. Puedes reservar desde hoy.",
        );
      }

      // ✅ Si es HOY, validar que la hora no sea en el pasado
      if (fechaReserva.getTime() === hoy.getTime()) {
        // Parsear hora inicio (formato HH:mm)
        const [horaStr, minutoStr] = dto.horaInicio.split(":").map(Number);
        const horaActual = new Date();
        const horaReserva = new Date(
          horaActual.getFullYear(),
          horaActual.getMonth(),
          horaActual.getDate(),
          horaStr,
          minutoStr,
          0,
        );

        // Si la hora de reserva es menor a la hora actual, rechazar
        if (horaReserva <= horaActual) {
          throw new BadRequestException(
            "No puedes reservar para una hora que ya pasó. Por favor selecciona una hora futura.",
          );
        }
      }

      return this.repository.create(dto);
    } catch (error) {
      // Si el error es nuestro BadRequestException, lanzarlo tal cual
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Si es otro error, lanzar error genérico
      throw new BadRequestException(
        "Error al validar la fecha y hora de la reserva",
      );
    }
  }

  // Cancela una reserva si está activa y se cumple la regla de 2 horas de anticipación.
  async cancelar(id: number) {
    const reserva = await this.repository.findOne(id);

    if (reserva.estado !== "activa") {
      throw new BadRequestException("Solo se pueden cancelar reservas activas");
    }

    const ahora = new Date();

    const fechaStr = reserva.fecha.toISOString().split("T")[0];
    const horaStr = reserva.horaInicio.toISOString().split("T")[1].slice(0, 5);

    const inicio = new Date(`${fechaStr}T${horaStr}:00`);
    const diffHoras = (inicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (diffHoras < 2) {
      throw new BadRequestException(
        "Se necesitan al menos 2 horas de anticipación para cancelar",
      );
    }

    return this.repository.cancelarEstado(id);
  }

  // Devuelve el historial de reservas de un usuario.
  findHistorial(usuarioId: number) {
    return this.repository.findHistorial(usuarioId);
  }

  // Elimina una reserva de la base de datos.
  remove(id: number) {
    return this.repository.remove(id);
  }
}
