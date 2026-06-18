import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { NotFoundException } from '@nestjs/common';
import { AzureService } from '../azure/azure.service';

@Injectable()
export class AssetsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly azureService: AzureService,
    ) { }

    async createAsset(
        dto: CreateAssetDto,
        organizationId: string,
        createdById: string,
    ) {
        const lastAsset = await this.prisma.asset.findFirst({
            // assetCode has a global @unique constraint in the schema,
            // so we must find the globally latest code (not per-org) to avoid
            // unique constraint collisions when a new org creates its first asset.
            orderBy: { assetCode: 'desc' },
            select: { assetCode: true },
        });

        let nextNumber = 1;
        if (lastAsset?.assetCode) {
            const match = lastAsset.assetCode.match(/AST-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        const assetCode = `AST-${String(
            nextNumber,
        ).padStart(4, '0')}`;

        const asset = await this.prisma.asset.create({
            data: {
                assetCode,
                assetName: dto.assetName,
                category: dto.category,
                location: dto.location,

                manufacturer: dto.manufacturer,
                modelNumber: dto.modelNumber,
                serialNumber: dto.serialNumber,

                capacity: dto.capacity,
                powerRating: dto.powerRating,

                description: dto.description,

                organizationId,
                createdById,
            },

            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            message: 'Asset Created Successfully',
            asset,
        };
    }

    async getAssets(
        organizationId: string,
        query: {
            page: number;
            limit: number;
            search?: string;
        },
    ) {
        const {
            page,
            limit,
            search,
        } = query;

        const skip = (page - 1) * limit;

        const where: any = {
            organizationId,
        };

        if (search) {
            where.OR = [
                {
                    assetName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    assetCode: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    location: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const total =
            await this.prisma.asset.count({
                where,
            });

        const assets =
            await this.prisma.asset.findMany({
                where,

                include: {
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,

                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },

                skip,
                take: limit,
            });

        return {
            data: assets,

            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };
    }

    async getAssetById(
        id: string,
        organizationId: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!asset) {
            throw new BadRequestException(
                'Asset not found',
            );
        }

        return asset;
    }

    async updateAsset(
        id: string,
        dto: UpdateAssetDto,
        organizationId: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id,
                organizationId,
            },
        });

        if (!asset) {
            throw new BadRequestException(
                'Asset not found',
            );
        }

        return this.prisma.asset.update({
            where: {
                id,
            },
            data: {
                assetName: dto.assetName,
                category: dto.category,
                location: dto.location,

                manufacturer: dto.manufacturer,
                modelNumber: dto.modelNumber,
                serialNumber: dto.serialNumber,

                capacity: dto.capacity,
                powerRating: dto.powerRating,

                description: dto.description,

                status: dto.status,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async deleteAsset(
        id: string,
        organizationId: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id,
                organizationId,
            },
        });

        if (!asset) {
            throw new BadRequestException(
                'Asset not found',
            );
        }

        await this.prisma.asset.delete({
            where: {
                id,
            },
        });

        return {
            message: 'Asset deleted successfully',
        };
    }
    async uploadAssetImage(
        assetId: string,
        organizationId: string,
        imageUrl: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id: assetId,
                organizationId,
            },
        });

        if (!asset) {
            throw new NotFoundException(
                'Asset not found',
            );
        }

        if (asset.imageUrl) {
            await this.azureService.deleteFile(
                asset.imageUrl,
            );
        }

        return this.prisma.asset.update({
            where: {
                id: assetId,
            },
            data: {
                imageUrl,
            },
        });
    }

    async getAssetImageStream(
        assetId: string,
        organizationId?: string,
    ) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id: assetId,
                ...(organizationId ? { organizationId } : {}),
            },
        });

        if (!asset || !asset.imageUrl) {
            throw new NotFoundException(
                'Asset or image not found',
            );
        }

        try {
            return await this.azureService.downloadFile(
                asset.imageUrl,
            );
        } catch (error) {
            throw new BadRequestException(
                'Failed to retrieve image from storage',
            );
        }
    }
}