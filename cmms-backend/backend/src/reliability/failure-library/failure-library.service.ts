import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFailureLibraryDto } from './dto/create-failure-library.dto';
import { UpdateFailureLibraryDto } from './dto/update-failure-library.dto';

@Injectable()
export class ReliabilityFailureLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFailureLibraryDto, organizationId: string) {
    return this.prisma.failureLibrary.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, query?: { search?: string; category?: string; assetCategory?: string }) {
    const where: any = { organizationId };

    if (query?.category && query.category !== 'ALL') {
      where.failureCategory = query.category;
    }

    if (query?.assetCategory && query.assetCategory !== 'ALL') {
      where.assetCategory = query.assetCategory;
    }

    if (query?.search) {
      where.OR = [
        { failureCode: { contains: query.search, mode: 'insensitive' } },
        { failureMode: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.failureLibrary.findMany({
      where,
      orderBy: { failureCode: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.failureLibrary.findFirst({
      where: { id, organizationId },
    });
    if (!item) throw new NotFoundException(`Failure Library item ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateFailureLibraryDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.failureLibrary.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.failureLibrary.delete({ where: { id } });
  }
}
