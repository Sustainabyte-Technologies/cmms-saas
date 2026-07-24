import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ServiceTicketRepository } from '../repositories/service-ticket.repository';
import { CreateServiceTicketDto } from '../dto/create-service-ticket.dto';
import { UpdateServiceTicketDto } from '../dto/update-service-ticket.dto';
import { UpdateServiceTicketStatusDto } from '../dto/update-status.dto';
import { QueryServiceTicketDto } from '../dto/query-service-ticket.dto';
import { CreateWorkOrderFromTicketDto } from '../dto/create-workorder.dto';

@Injectable()
export class ServiceTicketService {
  constructor(
    private readonly repository: ServiceTicketRepository,
  ) {}

  async createServiceTicket(
    dto: CreateServiceTicketDto,
    organizationId: string,
    userId: string,
  ) {
    if (!dto.title || !dto.description || !dto.category || !dto.priority || !dto.location || !dto.requestedById) {
      throw new BadRequestException('Title, Description, Category, Priority, Location, and Requested By are required.');
    }

    return this.repository.create(dto, organizationId, userId);
  }

  async getServiceTickets(organizationId: string, query: QueryServiceTicketDto) {
    return this.repository.findMany(organizationId, query);
  }

  async getServiceTicketById(id: string, organizationId: string) {
    const ticket = await this.repository.findById(id, organizationId);
    if (!ticket) {
      throw new NotFoundException(`Service Ticket with ID "${id}" not found.`);
    }
    return ticket;
  }

  async updateServiceTicket(
    id: string,
    dto: UpdateServiceTicketDto,
    organizationId: string,
    userId: string,
  ) {
    await this.getServiceTicketById(id, organizationId);
    return this.repository.update(id, organizationId, dto, userId);
  }

  async updateServiceTicketStatus(
    id: string,
    dto: UpdateServiceTicketStatusDto,
    organizationId: string,
    userId: string,
  ) {
    const ticket = await this.getServiceTicketById(id, organizationId);

    const extraFields = {
      resolution: dto.resolution || ticket.resolution || undefined,
      remarks: dto.remarks || ticket.remarks || undefined,
      assignedToId: dto.assignedToId || ticket.assignedToId || undefined,
    };

    return this.repository.updateStatus(
      id,
      organizationId,
      dto.status,
      extraFields,
      userId,
    );
  }

  async deleteServiceTicket(id: string, organizationId: string) {
    await this.getServiceTicketById(id, organizationId);
    await this.repository.delete(id, organizationId);
    return { success: true, message: `Service Ticket ${id} deleted successfully.` };
  }

  async createWorkOrderFromTicket(
    id: string,
    dto: CreateWorkOrderFromTicketDto,
    organizationId: string,
    userId: string,
  ) {
    const ticket = await this.getServiceTicketById(id, organizationId);

    if (ticket.isWorkOrderCreated || ticket.workOrderId) {
      throw new BadRequestException('Work Order already created for this Service Ticket.');
    }

    try {
      return await this.repository.createWorkOrderFromTicket(
        id,
        organizationId,
        dto,
        userId,
      );
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create Work Order from Service Ticket.');
    }
  }

  async getDashboardData(organizationId: string) {
    return this.repository.getDashboardStats(organizationId);
  }

  async getStatistics(organizationId: string) {
    return this.repository.getDashboardStats(organizationId);
  }
}
