import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Req,
    Param,
    Patch,
    Delete,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { CreateWorkOrderCommentDto } from './dto/create-work-order-comment.dto';
import { WorkOrdersService } from './work-orders.service';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { RejectWorkOrderDto } from './dto/reject-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-status.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateWorkOrderAttachmentDto } from './dto/create-work-order-attachment.dto';


@Controller('work-orders')
@UseGuards(
    JwtAuthGuard,
    RolesGuard,
)
export class WorkOrdersController {
    constructor(
        private readonly workOrdersService: WorkOrdersService,
    ) { }

    @Post()
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
    )
    async createWorkOrder(
        @Body() dto: CreateWorkOrderDto,
        @Req() req: any,
    ) {
        return this.workOrdersService.createWorkOrder(
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
        'TECHNICIAN',
    )
    async getWorkOrders(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('priority') priority?: string,
    ) {
        return this.workOrdersService.getWorkOrders(
            req.user.organizationId,
            req.user.sub,
            req.user.role,
            {
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                search,
                status,
                priority,
            },
        );
    }

    @Get(':id')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
        'TECHNICIAN',
    )
    async getWorkOrderById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.workOrdersService.getWorkOrderById(
            id,
            req.user.organizationId,
            req.user.sub,
            req.user.role,
        );
    }

    @Patch(':id')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
    )
    async updateWorkOrder(
        @Param('id') id: string,
        @Body() dto: UpdateWorkOrderDto,
        @Req() req: any,
    ) {
        return this.workOrdersService.updateWorkOrder(
            id,
            dto,
            req.user.organizationId,
            req.user.sub,
        );
    }

    @Delete(':id')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
    )
    async deleteWorkOrder(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.workOrdersService.deleteWorkOrder(
            id,
            req.user.organizationId,
        );
    }

    @Patch(':id/assign-technician')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
    )
    async assignTechnician(
        @Param('id') workOrderId: string,
        @Body() dto: AssignTechnicianDto,
        @Req() req: any,
    ) {
        return this.workOrdersService.assignTechnician(
            workOrderId,
            dto.technicianId,
            req.user.organizationId,
            req.user.sub,
        );
    }
    @Patch(':id/accept')
    @Roles('TECHNICIAN')
    async acceptWorkOrder(
        @Param('id') workOrderId: string,
        @Req() req: any,
    ) {
        return this.workOrdersService.acceptWorkOrder(
            workOrderId,
            req.user.sub,
            req.user.organizationId,
        );
    }
    @Patch(':id/reject')
    @Roles('TECHNICIAN')
    async rejectWorkOrder(
        @Param('id') workOrderId: string,
        @Body() dto: RejectWorkOrderDto,
        @Req() req: any,
    ) {
        return this.workOrdersService.rejectWorkOrder(
            workOrderId,
            dto.reason,
            req.user.sub,
            req.user.organizationId,
        );
    }
    @Patch(':id/status')
    @Roles('TECHNICIAN')
    async updateWorkOrderStatus(
        @Param('id') workOrderId: string,
        @Body() dto: UpdateWorkOrderStatusDto,
        @Req() req: any,
    ) {
        return this.workOrdersService.updateWorkOrderStatus(
            workOrderId,
            dto,
            req.user.sub,
            req.user.organizationId,
        );
    }
    @Post(':id/comments')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
        'TECHNICIAN',
    )
    async addComment(
        @Param('id') workOrderId: string,
        @Body() dto: CreateWorkOrderCommentDto,
        @Req() req: any,
    ) {
        return this.workOrdersService.addComment(
            workOrderId,
            dto.comment,
            req.user.sub,
            req.user.organizationId,
        );
    }
    @Get(':id/comments')
    @Roles(
        'ADMIN',
        'MAINTENANCE_MANAGER',
        'SUPERVISOR',
        'TECHNICIAN',
    )
    async getComments(
        @Param('id') workOrderId: string,
        @Req() req: any,
    ) {
        return this.workOrdersService.getComments(
            workOrderId,
            req.user.organizationId,
        );
    }
    @Post(':id/attachments')
    @UseInterceptors(
        FileInterceptor('file'),
    )
    uploadAttachment(
        @Param('id') id: string,

        @UploadedFile()
        file: Express.Multer.File,

        @Body()
        dto: CreateWorkOrderAttachmentDto,

        @Req() req: any,
    ) {
        return this.workOrdersService.uploadAttachment(
            id,
            req.user.organizationId,
            req.user.sub,
            file,
            dto.attachmentType,
        );
    }
    @Get(':id/attachments')
    getAttachments(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.workOrdersService.getAttachments(
            id,
            req.user.organizationId,
        );
    }

    @Get('attachments/:attachmentId')
    @Public()
    async getAttachmentFile(
        @Param('attachmentId') attachmentId: string,
        @Res() res: Response,
    ) {
        const fileStream = await this.workOrdersService.getAttachmentFileStream(attachmentId);
        res.setHeader('Content-Type', fileStream.contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(fileStream.buffer);
    }
}
