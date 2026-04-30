import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { EspaciosService } from '../service/espacios.service';
import { CreateEspacioDto } from '../dto/create-espacio.dto';
import { UpdateEspacioDto } from '../dto/update-espacio.dto';

@Controller('espacios')
export class EspaciosController {
  constructor(private readonly service: EspaciosService) {}

  @Get()
  findAll(@Query('sedeId') sedeId?: string) {
    return this.service.findAll(sedeId ? +sedeId : undefined);
  }

  // ✅ HU-04: disponibilidad dentro de espacios (endpoint nuevo)
  // IMPORTANTE: debe ir ANTES de @Get(':id')
  @Get('disponibles')
  disponibles(
    @Query('sedeId') sedeId: string,
    @Query('fecha') fecha: string,
    @Query('horaInicio') horaInicio: string,
    @Query('horaFin') horaFin: string,
  ) {
    return this.service.disponibles(+sedeId, fecha, horaInicio, horaFin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateEspacioDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEspacioDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
