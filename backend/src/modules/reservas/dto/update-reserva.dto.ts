import { PartialType } from '@nestjs/mapped-types';
import { CreateReservaDto } from './create-reserva.dto';

// DTO para actualizar una reserva.
// Hereda los campos de CreateReservaDto, pero todos son opcionales.
export class UpdateReservaDto extends PartialType(CreateReservaDto) {}
