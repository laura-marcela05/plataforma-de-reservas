import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TiposEspacioService } from '../service/tipos-espacio.service';
import { CreateTipoEspacioDto } from '../dto/create-tipo-espacio.dto';
import { UpdateTipoEspacioDto } from '../dto/update-tipo-espacio.dto';

@Controller('tipos-espacio')
export class TiposEspacioController {
  constructor(private readonly service: TiposEspacioService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateTipoEspacioDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTipoEspacioDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
