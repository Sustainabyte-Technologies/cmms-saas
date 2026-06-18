import {
    Controller,
    Get,
    Req,
    UseGuards,
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
        );
    }
    @Get('recent-activities')
    getRecentActivities(
        @Req() req: any,
    ) {
        return this.dashboardService.getRecentActivities(
            req.user.organizationId,
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
        );
    }

}