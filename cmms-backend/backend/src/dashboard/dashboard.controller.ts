import {
    Controller,
    Get,
    Req,
    UseGuards,
    Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get('overview')
    getOverview(@Req() req: any) {
        return this.dashboardService.getOverview(
            req.user.organizationId,
            req.user.role.name,
            req.user.id,
        );
    }
    @Get('work-order-status')
    getWorkOrderStatus(
        @Req() req: any,
    ) {
        return this.dashboardService.getWorkOrderStatus(
            req.user.organizationId,
            req.user.role.name,
            req.user.id,
        );
    }
    @Get('recent-activities')
    getRecentActivities(
        @Req() req: any,
    ) {
        return this.dashboardService.getRecentActivities(
            req.user.organizationId,
            req.user.role.name,
            req.user.id,
        );
    }
    @Get('user-role-distribution')
    getUserRoleDistribution(
        @Req() req: any,
    ) {
        return this.dashboardService.getUserRoleDistribution(
            req.user.organizationId,
        );
    }
    @Get('technician-workload')
    getTechnicianWorkload(
        @Req() req: any,
    ) {
        return this.dashboardService.getTechnicianWorkload(
            req.user.organizationId,
            req.user.role.name,
            req.user.id,
        );
    }
    @Get('dashboard-summary')
    async getDashboardSummary(
        @Req() req: any,
        @Query('search') search?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '5',
    ) {
        return this.dashboardService.getDashboardSummary(
            req.user.organizationId,
            req.user.role.name,
            req.user.id,
            search,
            Number(page),
            Number(limit),
        );
    }
}