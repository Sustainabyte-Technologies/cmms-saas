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
import { ServiceTicketService } from '../services/service-ticket.service';
import { CreateServiceTicketDto } from '../dto/create-service-ticket.dto';
import { UpdateServiceTicketDto } from '../dto/update-service-ticket.dto';
import { UpdateServiceTicketStatusDto } from '../dto/update-status.dto';
import { QueryServiceTicketDto } from '../dto/query-service-ticket.dto';
import { CreateWorkOrderFromTicketDto } from '../dto/create-workorder.dto';

@Controller('service-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceTicketController {
  constructor(private readonly serviceTicketService: ServiceTicketService) {}

  @Post()
  async createServiceTicket(
    @Body() dto: CreateServiceTicketDto,
    @Req() req: any,
  ) {
    return this.serviceTicketService.createServiceTicket(
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }

  @Get()
  async getServiceTickets(
    @Query() query: QueryServiceTicketDto,
    @Req() req: any,
  ) {
    return this.serviceTicketService.getServiceTickets(
      req.user.organizationId,
      query,
    );
  }

  @Get('dashboard')
  async getDashboardData(@Req() req: any) {
    return this.serviceTicketService.getDashboardData(req.user.organizationId);
  }

  @Get('statistics')
  async getStatistics(@Req() req: any) {
    return this.serviceTicketService.getStatistics(req.user.organizationId);
  }

  @Get(':id')
  async getServiceTicketById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.serviceTicketService.getServiceTicketById(
      id,
      req.user.organizationId,
    );
  }

  @Patch(':id')
  async updateServiceTicket(
    @Param('id') id: string,
    @Body() dto: UpdateServiceTicketDto,
    @Req() req: any,
  ) {
    return this.serviceTicketService.updateServiceTicket(
      id,
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }

  @Delete(':id')
  async deleteServiceTicket(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.serviceTicketService.deleteServiceTicket(
      id,
      req.user.organizationId,
    );
  }

  @Patch(':id/status')
  async updateServiceTicketStatus(
    @Param('id') id: string,
    @Body() dto: UpdateServiceTicketStatusDto,
    @Req() req: any,
  ) {
    return this.serviceTicketService.updateServiceTicketStatus(
      id,
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }

  @Post(':id/create-workorder')
  async createWorkOrderFromTicket(
    @Param('id') id: string,
    @Body() dto: CreateWorkOrderFromTicketDto,
    @Req() req: any,
  ) {
    return this.serviceTicketService.createWorkOrderFromTicket(
      id,
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }
}
