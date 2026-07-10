import { Controller, Post, Req, Body, Get, Param, Patch, Delete, Res, Query } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomersService } from './customers.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSiteDto } from './dto/create-site.dto';
import { UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateCustomerDto } from './dto/update_customer.dto';
import { UpdateSiteDto } from './dto/update_site_dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureService } from '../azure/azure.service';
import { Public } from '../auth/decorators/public.decorator';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {

    constructor(
        private customersService: CustomersService,
        private readonly azureService: AzureService,
    ) { }

    // ── Sites (must be before :id routes) ────────────────────────────────────

    @Post('sites')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE')
    createSite(
        @Req() req: any,
        @Body() dto: CreateSiteDto,
    ) {
        return this.customersService.createSite(req.user.organizationId, dto, req.user.sub);
    }

    @Get('sites/assignable-supervisors')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE')
    async getAssignableSupervisors(@Req() req: any) {
        return this.customersService.getUsersForAssignment(
            req.user.organizationId,
            ['SITE_INCHARGE'],
        );
    }

    @Get('departments/assignable-supervisors')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE')
    async getAssignableDeptSupervisors(@Req() req: any) {
        return this.customersService.getUsersForAssignment(
            req.user.organizationId,
            ['SUPERVISOR'],
        );
    }

    @Get('sites')
    async getSites(
        @Req() req: any,
        @Query('search') search?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.customersService.getSites(
            req.user.organizationId,
            search,
            Number(page),
            Number(limit),
        );
    }

    @Get('sites/:id')
    async getSiteById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.customersService.getSiteById(id, req.user.organizationId);
    }

    @Patch('sites/:id')
    async updateSite(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateSiteDto,
    ) {
        return this.customersService.updateSite(id, req.user.organizationId, dto, req.user.role, req.user.sub);
    }

    @Delete('sites/:id')
    async deleteSite(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.customersService.deleteSite(id, req.user.organizationId, req.user.role, req.user.sub);
    }

    @Post('sites/:id/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadSiteImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const imageUrl = await this.azureService.uploadFile(file, 'sites');
        return this.customersService.uploadSiteImage(id, req.user.organizationId, imageUrl);
    }

    @Get('sites/:id/image')
    @Public()
    async getSiteImage(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const imageStream = await this.customersService.getSiteImageStream(id);
        res.setHeader('Content-Type', imageStream.contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(imageStream.buffer);
    }

    // ── Departments (must be before :id routes) ───────────────────────────────

    @Post('departments')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async createDepartment(
        @Req() req: any,
        @Body() dto: CreateDepartmentDto,
    ) {
        return this.customersService.createDepartment(req.user.organizationId, dto, req.user.sub);
    }

    @Get('departments')
    async getDepartments(
        @Req() req: any,
        @Query('search') search?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.customersService.getDepartments(
            req.user.organizationId,
            search,
            Number(page),
            Number(limit),
        );
    }

    @Get('departments/:id')
    async getDepartmentById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.customersService.getDepartmentById(id, req.user.organizationId);
    }

    @Patch('departments/:id')
    async updateDepartment(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateDepartmentDto,
    ) {
        return this.customersService.updateDepartment(id, req.user.organizationId, dto, req.user.role, req.user.sub);
    }

    @Delete('departments/:id')
    async deleteDepartment(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.customersService.deleteDepartment(id, req.user.organizationId, req.user.role, req.user.sub);
    }

    // ── Systems (must be before :id routes) ──────────────────────────────────

    @Post('systems')
    @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
    async createSystem(
        @Req() req: any,
        @Body() dto: CreateSystemDto,
    ) {
        return this.customersService.createSystem(req.user.organizationId, dto, req.user.sub);
    }

    @Get('systems')
    async getSystems(
        @Req() req: any,
        @Query('search') search?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.customersService.getSystems(
            req.user.organizationId,
            search,
            Number(page),
            Number(limit),
        );
    }

    @Get('systems/:id')
    async getSystemById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.customersService.getSystemById(id, req.user.organizationId);
    }

    @Patch('systems/:id')
    async updateSystem(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateSystemDto,
    ) {
        return this.customersService.updateSystem(id, req.user.organizationId, dto, req.user.role, req.user.sub);
    }

    @Delete('systems/:id')
    async deleteSystem(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.customersService.deleteSystem(id, req.user.organizationId, req.user.role, req.user.sub);
    }

    @Post('systems/:id/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadSystemImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const imageUrl = await this.azureService.uploadFile(file, 'systems');
        return this.customersService.uploadSystemImage(id, req.user.organizationId, imageUrl);
    }

    @Get('systems/:id/image')
    @Public()
    async getSystemImage(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const imageStream = await this.customersService.getSystemImageStream(id);
        res.setHeader('Content-Type', imageStream.contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(imageStream.buffer);
    }

    // ── User Assignment Endpoints ──────────────────────────────────────────

    @Get('assignable-managers')
    @Roles('ADMIN', 'CUSTOMER_MANAGER')
    async getAssignableManagers(@Req() req: any) {
        return this.customersService.getUsersForAssignment(
            req.user.organizationId,
            ['CUSTOMER_MANAGER'],
        );
    }

    // ── Customers (wildcard :id routes last) ─────────────────────────────────

    @Post()
    @Roles('ADMIN', 'CUSTOMER_MANAGER')
    createCustomer(
        @Req() req: any,
        @Body() dto: CreateCustomerDto,

    ) {
        return this.customersService.createCustomer(req.user.organizationId, dto, req.user.sub);
    }

    @Get()
    async getCustomers(
        @Req() req: any,
        @Query('search') search?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.customersService.getCustomers(
            req.user.organizationId,
            search,
            Number(page),
            Number(limit),
        );
    }

    @Get(':id')
    async getCustomerById(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.customersService.getCustomerById(id, req.user.organizationId);
    }

    @Patch(':id')
    async updateCustomer(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: UpdateCustomerDto,
    ) {
        return this.customersService.updateCustomer(id, req.user.organizationId, dto, req.user.role, req.user.sub);
    }

    @Delete(':id')
    async deleteCustomer(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.customersService.deleteCustomer(id, req.user.organizationId, req.user.role, req.user.sub);
    }

    @Post(':id/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCustomerImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const imageUrl = await this.azureService.uploadFile(file, 'customers');
        return this.customersService.uploadCustomerImage(id, req.user.organizationId, imageUrl);
    }

    @Get(':id/image')
    @Public()
    async getCustomerImage(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const imageStream = await this.customersService.getCustomerImageStream(id);
        res.setHeader('Content-Type', imageStream.contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(imageStream.buffer);
    }
}
