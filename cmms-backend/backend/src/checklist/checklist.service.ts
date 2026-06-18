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
  ) {
    return this.prisma.checklistTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        organizationId,
      },
    });
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
  ) {
    await this.prisma.checklistTemplate.findFirstOrThrow({
      where: {
        id,
        organizationId,
      },
    });

    return this.prisma.checklistTemplate.update({
      where: {
        id,
      },
      data: dto,
    });
  }
  async deleteTemplate(
    id: string,
    organizationId: string,
  ) {
    await this.prisma.checklistTemplate.findFirstOrThrow({
      where: {
        id,
        organizationId,
      },
    });

    return this.prisma.checklistTemplate.delete({
      where: {
        id,
      },
    });
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