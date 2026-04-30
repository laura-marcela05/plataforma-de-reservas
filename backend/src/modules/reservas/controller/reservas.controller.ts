import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { ReservasService } from '../service/reservas.service';
import { CreateReservaDto } from '../dto/create-reserva.dto';

// Controller para el módulo de reservas.
// Define las rutas HTTP que el frontend puede invocar.
@Controller('reservas')
export class ReservasController {
  constructor(private readonly service: ReservasService) {}

  // GET /reservas
  // Devuelve todas las reservas registradas.
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // GET /reservas/historial?usuarioId=123
  // Devuelve el historial de reservas de un usuario.
  @Get('historial')
  findHistorial(@Query('usuarioId') usuarioId: string) {
    return this.service.findHistorial(+usuarioId);
  }

  // GET /reservas/:id
  // Retorna los detalles de una reserva específica.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // POST /reservas
  // Crea una nueva reserva usando los datos enviados.
  @Post()
  create(@Body() dto: CreateReservaDto) {
    return this.service.create(dto);
  }

  // PATCH /reservas/:id/cancelar
  // Cancela una reserva activa si cumple la regla de anticipación.
  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.service.cancelar(+id);
  }

  // DELETE /reservas/:id
  // Elimina una reserva por su ID.
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
