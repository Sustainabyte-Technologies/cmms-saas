import {
    Body,
    Controller,
    Post,
    Get,
    Patch,
    Query,
    Param,
    Delete,
    Req,
    UseGuards,
} from '@nestjs/common';
import { PreventiveMaintenanceService } from './preventive-maintenance.service';
import { CreatePreventiveMaintenanceDto } from './dto/create-preventive-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePreventiveMaintenanceDto } from './dto/update-preventive-maintenance.dto';
@Controller('preventive-maintenance')
@UseGuards(JwtAuthGuard)
export class PreventiveMaintenanceController {
    constructor(
        private readonly preventiveMaintenanceService: PreventiveMaintenanceService,
    ) { }

    @Post()
    create(
        @Req() req: any,
        @Body()
        dto: CreatePreventiveMaintenanceDto,
    ) {
        return this.preventiveMaintenanceService.create(
            req.user.organizationId,
            req.user.sub,
            dto,
        );
    }
    @Get()
    getAll(
        @Req() req: any,
    ) {
        return this.preventiveMaintenanceService.getAll(
            req.user.organizationId,
        );
    }

    @Get('dashboard/summary')
    getPMDashboardSummary(
        @Req() req: any,
    ) {
        return this.preventiveMaintenanceService.getPmDashboardSummary(
            req.user.organizationId,
        );
    }

    @Get('dashboard/status-distribution')
    getPmStatusDistribution(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmStatusDistribution(
            req.user.organizationId,
        );
    }

    @Get('dashboard/frequency')
    getPmFrequencyBreakdown(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmFrequencyBreakdown(
            req.user.organizationId,
        );
    }

    @Get('dashboard/upcoming')
    getPmUpcomingList(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmUpcomingList(
            req.user.organizationId,
        );
    }

    @Get('dashboard/overdue')
    getPmOverdueList(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmOverdueList(
            req.user.organizationId,
        );
    }

    @Get('dashboard/auto-work-orders')
    getPmAutoWorkOrders(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmAutoWorkOrders(
            req.user.organizationId,
        );
    }

    @Get('dashboard/by-location')
    getPmByLocation(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmByLocation(
            req.user.organizationId,
        );
    }

    @Get('dashboard/recent-activities')
    getPmRecentActivities(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmRecentActivities(
            req.user.organizationId,
        );
    }

    @Get('dashboard/performance')
    getPmPerformanceSummary(@Req() req: any) {
        return this.preventiveMaintenanceService.getPmPerformanceSummary(
            req.user.organizationId,
        );
    }

    @Get('calendar')
    async getCalendarEvents(
        @Req() req,
        @Query('month') month: string,
        @Query('year') year: string,

        @Query('customerId') customerId?: string,
        @Query('siteId') siteId?: string,
        @Query('departmentId') departmentId?: string,
        @Query('systemId') systemId?: string,
        @Query('assetId') assetId?: string,

        @Query('technicianId') technicianId?: string,

        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('frequency') frequency?: string,

        @Query('search') search?: string,
    ) {
        return this.preventiveMaintenanceService.getCalendarEvents(
            req.user.organizationId,
            Number(month),
            Number(year),

            customerId,
            siteId,
            departmentId,
            systemId,
            assetId,

            technicianId,

            status,
            priority,
            frequency,

            search,
        );
    }
    @Get('calendar/:id')
    async getCalendarEventDetails(
        @Req() req,
        @Param('id') id: string,
    ) {
        return this.preventiveMaintenanceService.getCalendarEventDetails(
            id,
            req.user.organizationId,
        );
    }

    @Get(':id')
    getById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.preventiveMaintenanceService.getById(
            id,
            req.user.organizationId,
        );
    }
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdatePreventiveMaintenanceDto,
    ) {
        return this.preventiveMaintenanceService.update(
            id,
            req.user.organizationId,
            dto,
        );
    }
    @Delete(':id')
    remove(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.preventiveMaintenanceService.remove(
            id,
            req.user.organizationId,
        );
    }
    @Post(':id/generate-work-order')
    generateWorkOrder(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.preventiveMaintenanceService.generateWorkOrder(
            id,
            req.user.organizationId,
            req.user.sub,
        );
    }
    @Get(':id/history')
    getHistory(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.preventiveMaintenanceService.getHistory(
            id,
            req.user.organizationId,
        );
    }
}