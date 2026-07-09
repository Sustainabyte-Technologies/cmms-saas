import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { CreateChecklistTemplateItemDto } from './dto/create-checklist-template-item.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
@Injectable()
export class ChecklistService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async createTemplate(
    dto: CreateChecklistTemplateDto,
    organizationId: string,
    userId: string,
  ) {
    const template = await this.prisma.checklistTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        organizationId,
        action: 'CREATED',
        entityType: 'CHECKLIST',
        entityId: template.id,
        entityName: template.name,
        remarks: `Checklist Template ${template.name} was created.`,
        performedById: userId,
      }
    });

    return template;
  }
  async createTemplateItem(
    templateId: string,
    dto: CreateChecklistTemplateItemDto,
  ) {
    return this.prisma.checklistTemplateItem.create({
      data: {
        templateId,
        title: dto.title,
        isRequired: dto.isRequired ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }
  async getTemplates(organizationId: string) {
    return this.prisma.checklistTemplate.findMany({
      where: {
        organizationId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async getTemplateById(
    id: string,
    organizationId: string,
  ) {
    return this.prisma.checklistTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        items: true,
      },
    });
  }
  async updateTemplate(
    id: string,
    organizationId: string,
    dto: UpdateChecklistTemplateDto,
    userId: string,
  ) {
    await this.prisma.checklistTemplate.findFirstOrThrow({
      where: {
        id,
        organizationId,
      },
    });

    const updated = await this.prisma.checklistTemplate.update({
      where: {
        id,
      },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        organizationId,
        action: 'UPDATED',
        entityType: 'CHECKLIST',
        entityId: updated.id,
        entityName: updated.name,
        remarks: `Checklist Template ${updated.name} was updated.`,
        performedById: userId,
      }
    });

    return updated;
  }
  async deleteTemplate(
    id: string,
    organizationId: string,
    userId: string,
  ) {
    await this.prisma.checklistTemplate.findFirstOrThrow({
      where: {
        id,
        organizationId,
      },
    });

    const deleted = await this.prisma.checklistTemplate.delete({
      where: {
        id,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        organizationId,
        action: 'DELETED',
        entityType: 'CHECKLIST',
        entityId: deleted.id,
        entityName: deleted.name,
        remarks: `Checklist Template ${deleted.name} was deleted.`,
        performedById: userId,
      }
    });

    return deleted;
  }
  async deleteTemplateItem(
    itemId: string,
  ) {
    return this.prisma.checklistTemplateItem.delete({
      where: {
        id: itemId,
      },
    });
  }
}