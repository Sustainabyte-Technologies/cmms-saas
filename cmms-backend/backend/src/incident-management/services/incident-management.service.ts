import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { IncidentManagementRepository } from '../repositories/incident-management.repository';
import { CreateIncidentDto } from '../dto/create-incident.dto';
import { UpdateIncidentDto } from '../dto/update-incident.dto';
import { UpdateIncidentStatusDto } from '../dto/update-status.dto';
import { QueryIncidentDto } from '../dto/query-incident.dto';
import { CreateWorkOrderFromIncidentDto } from '../dto/create-workorder.dto';
import { IncidentStatus } from '../enums/incident.enums';

@Injectable()
export class IncidentManagementService {
  constructor(
    private readonly repository: IncidentManagementRepository,
  ) {}

  async createIncident(
    dto: CreateIncidentDto,
    organizationId: string,
    userId: string,
  ) {
    if (!dto.title || !dto.description || !dto.incidentType || !dto.severity || !dto.location || !dto.reportedById || !dto.incidentDate) {
      throw new BadRequestException('Title, Description, Incident Type, Severity, Location, Reported By, and Incident Date are required.');
    }

    return this.repository.create(dto, organizationId, userId);
  }

  async getIncidents(organizationId: string, query: QueryIncidentDto) {
    return this.repository.findMany(organizationId, query);
  }

  async getIncidentById(id: string, organizationId: string) {
    const incident = await this.repository.findById(id, organizationId);
    if (!incident) {
      throw new NotFoundException(`Incident with ID "${id}" not found.`);
    }
    return incident;
  }

  async updateIncident(
    id: string,
    dto: UpdateIncidentDto,
    organizationId: string,
    userId: string,
  ) {
    await this.getIncidentById(id, organizationId);
    return this.repository.update(id, organizationId, dto, userId);
  }

  async updateIncidentStatus(
    id: string,
    dto: UpdateIncidentStatusDto,
    organizationId: string,
    userId: string,
    userRole: string,
  ) {
    const incident = await this.getIncidentById(id, organizationId);

    // Business rule: Only Admin, Safety Officer, Maintenance Manager can Close Incident
    if (dto.status === IncidentStatus.CLOSED) {
      const normalizedRole = userRole?.toUpperCase() || '';
      const allowedRoles = ['ADMIN', 'SAFETY_OFFICER', 'MAINTENANCE_MANAGER'];
      if (!allowedRoles.includes(normalizedRole)) {
        throw new ForbiddenException(
          'Only Admin, Safety Officer, and Maintenance Manager can close an incident.',
        );
      }
    }

    const extraFields = {
      resolution: dto.resolution || incident.resolution || undefined,
      rootCause: dto.rootCause || incident.rootCause || undefined,
      correctiveAction: dto.correctiveAction || incident.correctiveAction || undefined,
      preventiveAction: dto.preventiveAction || incident.preventiveAction || undefined,
      remarks: dto.remarks || incident.remarks || undefined,
    };

    return this.repository.updateStatus(
      id,
      organizationId,
      dto.status,
      extraFields,
      userId,
    );
  }

  async deleteIncident(id: string, organizationId: string) {
    await this.getIncidentById(id, organizationId);
    await this.repository.delete(id, organizationId);
    return { success: true, message: `Incident ${id} deleted successfully.` };
  }

  async createWorkOrderFromIncident(
    id: string,
    dto: CreateWorkOrderFromIncidentDto,
    organizationId: string,
    userId: string,
  ) {
    const incident = await this.getIncidentById(id, organizationId);

    // Business rule: One incident can create only one Work Order
    if (incident.isWorkOrderCreated || incident.workOrderId) {
      throw new BadRequestException('Work Order already created for this incident.');
    }

    try {
      return await this.repository.createWorkOrderFromIncident(
        id,
        organizationId,
        dto,
        userId,
      );
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create Work Order from Incident.');
    }
  }

  async getDashboardData(organizationId: string) {
    return this.repository.getDashboardStats(organizationId);
  }

  async getStatistics(organizationId: string) {
    return this.repository.getDashboardStats(organizationId);
  }
}
