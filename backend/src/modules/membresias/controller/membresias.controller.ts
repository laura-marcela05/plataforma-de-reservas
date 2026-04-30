import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MembresiasService } from '../service/membresias.service';
import { CreateMembresiaDto } from '../dto/create-membresia.dto';
import { UpdateMembresiaDto } from '../dto/update-membresia.dto';

@Controller('membresias')
export class MembresiasController {
  constructor(private readonly service: MembresiasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateMembresiaDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMembresiaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
