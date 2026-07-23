import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ReliabilityFailureLibraryService } from './failure-library.service';
import { CreateFailureLibraryDto } from './dto/create-failure-library.dto';
import { UpdateFailureLibraryDto } from './dto/update-failure-library.dto';

@Controller('reliability/failure-library')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityFailureLibraryController {
  constructor(private readonly service: ReliabilityFailureLibraryService) {}

  @Post()
  create(@Body() dto: CreateFailureLibraryDto, @Req() req: any) {
    return this.service.create(dto, req.user.organizationId);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('assetCategory') assetCategory?: string,
  ) {
    return this.service.findAll(req.user.organizationId, { search, category, assetCategory });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFailureLibraryDto, @Req() req: any) {
    return this.service.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.organizationId);
  }
}
