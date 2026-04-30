// Clase que representa una reserva dentro del módulo de reservas.
// Describe los campos que usa la aplicación cuando procesa reservas.
export class ReservaEntity {
  // ID único de la reserva.
  id!: number;

  // ID del usuario que hizo la reserva.
  usuarioId!: number;

  // ID del espacio reservado.
  espacioId!: number;

  // Fecha de la reserva.
  fecha!: Date;

  // Hora de inicio de la reserva.
  horaInicio!: Date;

  // Hora de fin de la reserva.
  horaFin!: Date;

  // Estado actual: activa o cancelada.
  estado!: string;

  // Fecha en que se creó la reserva en el sistema.
  fechaCreacion!: Date;

  // Marca de tiempo automática de creación.
  createdAt!: Date;

  // Marca de tiempo automática de última actualización.
  updatedAt!: Date;
}
