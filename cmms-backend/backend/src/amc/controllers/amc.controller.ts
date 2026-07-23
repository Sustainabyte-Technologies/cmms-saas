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
import { AMCService } from '../services/amc.service';
import { CreateAMCDto } from '../dto/create-amc.dto';
import { UpdateAMCDto } from '../dto/update-amc.dto';
import { QueryAMCDto } from '../dto/query-amc.dto';
import { MapAMCAssetsDto } from '../dto/map-assets.dto';
import { RenewAMCDto } from '../dto/renew-amc.dto';
import { GenerateAMCPMDto } from '../dto/generate-pm.dto';

@Controller('amc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AMCController {
  constructor(private readonly amcService: AMCService) {}

  @Post()
  async createAMC(@Body() dto: CreateAMCDto, @Req() req: any) {
    return this.amcService.createAMC(dto, req.user.organizationId, req.user.sub);
  }

  @Get()
  async getAMCs(@Query() query: QueryAMCDto, @Req() req: any) {
    return this.amcService.getAMCs(req.user.organizationId, query);
  }

  @Get('dashboard')
  async getDashboardData(@Req() req: any) {
    return this.amcService.getDashboardData(req.user.organizationId);
  }

  @Get('statistics')
  async getStatistics(@Req() req: any) {
    return this.amcService.getStatistics(req.user.organizationId);
  }

  @Get('expiring')
  async getExpiringContracts(@Req() req: any) {
    return this.amcService.getExpiringContracts(req.user.organizationId);
  }

  @Get('asset-status/:assetId')
  async checkAssetAMCStatus(@Param('assetId') assetId: string, @Req() req: any) {
    return this.amcService.checkAssetAMCStatus(assetId, req.user.organizationId);
  }

  @Get(':id')
  async getAMCById(@Param('id') id: string, @Req() req: any) {
    return this.amcService.getAMCById(id, req.user.organizationId);
  }

  @Patch(':id')
  async updateAMC(
    @Param('id') id: string,
    @Body() dto: UpdateAMCDto,
    @Req() req: any,
  ) {
    return this.amcService.updateAMC(id, dto, req.user.organizationId, req.user.sub);
  }

  @Delete(':id')
  async deleteAMC(@Param('id') id: string, @Req() req: any) {
    return this.amcService.deleteAMC(id, req.user.organizationId);
  }

  @Post(':id/map-assets')
  async mapAssets(
    @Param('id') id: string,
    @Body() dto: MapAMCAssetsDto,
    @Req() req: any,
  ) {
    return this.amcService.mapAssets(id, dto, req.user.organizationId);
  }

  @Post(':id/renew')
  async renewAMC(
    @Param('id') id: string,
    @Body() dto: RenewAMCDto,
    @Req() req: any,
  ) {
    return this.amcService.renewAMC(id, dto, req.user.organizationId, req.user.sub);
  }

  @Post(':id/generate-pm')
  async generatePM(
    @Param('id') id: string,
    @Body() dto: GenerateAMCPMDto,
    @Req() req: any,
  ) {
    return this.amcService.generatePMAmCSchedules(id, dto, req.user.organizationId, req.user.sub);
  }
}
