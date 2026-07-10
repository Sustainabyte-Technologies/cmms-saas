import {
    Controller,
    Post,
    Get,
    Patch,
    Query,
    Delete,
    Body,
    Req,
    UseGuards,
    Param,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';

import { AssetsService } from './assets.service';
import { AzureService } from '../azure/azure.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { FileInterceptor, } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
    constructor(
        private readonly assetsService: AssetsService,
        private readonly azureService: AzureService,
    ) { }

    @Post()
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async createAsset(
        @Body() dto: CreateAssetDto,
        @Req() req: any,
    ) {
        return this.assetsService.createAsset(
            dto,
            req.user.organizationId,
            req.user.sub,
        );
    }

    @Get()
    @Roles(
        'ADMIN',
        'CUSTOMER_MANAGER',
        'SITE_INCHARGE',
        'SUPERVISOR',
        'TECHNICIAN',
    )
    async getAssets(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.assetsService.getAssets(
            req.user.organizationId,
            {
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                search,
            },
            req.user.sub,
            req.user.role,
        );
    }

    @Get('dashboard/stats')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardStats(@Req() req: any) {
        return this.assetsService.getDashboardStats(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/categories')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardCategories(@Req() req: any) {
        return this.assetsService.getDashboardCategories(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/locations')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardLocations(@Req() req: any) {
        return this.assetsService.getDashboardLocations(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/warranty')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardWarranty(@Req() req: any) {
        return this.assetsService.getDashboardWarranty(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/health')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardHealth(@Req() req: any) {
        return this.assetsService.getDashboardHealth(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/downtime')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardDowntime(@Req() req: any) {
        return this.assetsService.getDashboardDowntime(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/health-distribution')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardHealthDistribution(@Req() req: any) {
        return this.assetsService.getDashboardHealthDistribution(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/lifecycle')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardLifecycle(@Req() req: any) {
        return this.assetsService.getDashboardLifecycle(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/location-hierarchy')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardLocationHierarchy(@Req() req: any) {
        return this.assetsService.getDashboardLocationHierarchy(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get('dashboard/critical-list')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async getDashboardCriticalList(@Req() req: any) {
        return this.assetsService.getDashboardCriticalList(
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Get(':id')
    @Roles(
        'ADMIN',
        'CUSTOMER_MANAGER',
        'SITE_INCHARGE',
        'SUPERVISOR',
        'TECHNICIAN',
    )
    async getAssetById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.assetsService.getAssetById(
            id,
            req.user.organizationId,
            req.user.sub,
            req.user.role,
        );
    }

    @Patch(':id')
    @Roles(
        'ADMIN',
        'CUSTOMER_MANAGER',
        'SITE_INCHARGE',
        'SUPERVISOR',
    )
    async updateAsset(
        @Param('id') id: string,
        @Body() dto: UpdateAssetDto,
        @Req() req: any,
    ) {
        return this.assetsService.updateAsset(
            id,
            dto,
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Delete(':id')
    @Roles(
        'ADMIN',
        'CUSTOMER_MANAGER',
        'SITE_INCHARGE',
        'SUPERVISOR',
    )
    async deleteAsset(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.assetsService.deleteAsset(
            id,
            req.user.organizationId,
            req.user.role,
            req.user.sub,
        );
    }

    @Post(':id/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAssetImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const imageUrl =
            await this.azureService.uploadFile(
                file,
                'assets',
            );

        return this.assetsService.uploadAssetImage(
            id,
            req.user.organizationId,
            imageUrl,
        );
    }

    @Get(':id/image')
    @Public()
    async getAssetImage(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const imageStream = await this.assetsService.getAssetImageStream(id);
        res.setHeader('Content-Type', imageStream.contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(imageStream.buffer);
    }
}