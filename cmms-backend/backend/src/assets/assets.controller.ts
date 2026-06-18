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
    @Roles('ADMIN', 'MAINTENANCE_MANAGER', 'SUPERVISOR')
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
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
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
        );
    }

    @Get(':id')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
    )
    async getAssetById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.assetsService.getAssetById(
            id,
            req.user.organizationId,
        );
    }

    @Patch(':id')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
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
        );
    }

    @Delete(':id')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
    )
    async deleteAsset(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.assetsService.deleteAsset(
            id,
            req.user.organizationId,
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