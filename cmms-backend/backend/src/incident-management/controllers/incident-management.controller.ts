import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { IncidentManagementService } from '../services/incident-management.service';
import { CreateIncidentDto } from '../dto/create-incident.dto';
import { UpdateIncidentDto } from '../dto/update-incident.dto';
import { UpdateIncidentStatusDto } from '../dto/update-status.dto';
import { QueryIncidentDto } from '../dto/query-incident.dto';
import { CreateWorkOrderFromIncidentDto } from '../dto/create-workorder.dto';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentManagementController {
  constructor(
    private readonly incidentService: IncidentManagementService,
  ) {}

  @Post()
  async createIncident(@Body() dto: CreateIncidentDto, @Req() req: any) {
    return this.incidentService.createIncident(
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }

  @Get()
  async getIncidents(@Query() query: QueryIncidentDto, @Req() req: any) {
    return this.incidentService.getIncidents(
      req.user.organizationId,
      query,
    );
  }

  @Get('dashboard')
  async getDashboardData(@Req() req: any) {
    return this.incidentService.getDashboardData(req.user.organizationId);
  }

  @Get('statistics')
  async getStatistics(@Req() req: any) {
    return this.incidentService.getStatistics(req.user.organizationId);
  }

  @Get(':id')
  async getIncidentById(@Param('id') id: string, @Req() req: any) {
    return this.incidentService.getIncidentById(id, req.user.organizationId);
  }

  @Patch(':id')
  async updateIncident(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
    @Req() req: any,
  ) {
    return this.incidentService.updateIncident(
      id,
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteIncident(@Param('id') id: string, @Req() req: any) {
    return this.incidentService.deleteIncident(id, req.user.organizationId);
  }

  @Patch(':id/status')
  async updateIncidentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
    @Req() req: any,
  ) {
    return this.incidentService.updateIncidentStatus(
      id,
      dto,
      req.user.organizationId,
      req.user.sub,
      req.user.role,
    );
  }

  @Post(':id/create-workorder')
  async createWorkOrderFromIncident(
    @Param('id') id: string,
    @Body() dto: CreateWorkOrderFromIncidentDto,
    @Req() req: any,
  ) {
    return this.incidentService.createWorkOrderFromIncident(
      id,
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }
}
