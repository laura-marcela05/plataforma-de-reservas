import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoEspacioDto } from './create-tipo-espacio.dto';

export class UpdateTipoEspacioDto extends PartialType(CreateTipoEspacioDto) {}
