import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Req,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { CreateChecklistTemplateItemDto } from './dto/create-checklist-template-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';


@Controller('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChecklistController {
  constructor(
    private readonly checklistService: ChecklistService,
  ) { }

  @Post('templates')
  @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
  createTemplate(
    @Body() dto: CreateChecklistTemplateDto,
    @Req() req: any,
  ) {
    return this.checklistService.createTemplate(
      dto,
      req.user.organizationId,
      req.user.sub,
    );
  }
  @Post('templates/:templateId/items')
  createTemplateItem(
    @Param('templateId') templateId: string,
    @Body() dto: CreateChecklistTemplateItemDto,
  ) {
    return this.checklistService.createTemplateItem(
      templateId,
      dto,
    );
  }
  @Get('templates')
  getTemplates(
    @Req() req: any,
  ) {
    return this.checklistService.getTemplates(
      req.user.organizationId,
    );
  }
  @Get('templates/:id')
  getTemplateById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.checklistService.getTemplateById(
      id,
      req.user.organizationId,
    );
  }
  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateChecklistTemplateDto,
    @Req() req: any,
  ) {
    return this.checklistService.updateTemplate(
      id,
      req.user.organizationId,
      dto,
      req.user.sub,
    );
  }
  @Delete('items/:itemId')
  deleteTemplateItem(
    @Param('itemId') itemId: string,
  ) {
    return this.checklistService.deleteTemplateItem(
      itemId,
    );
  }
  @Delete('templates/:id')
  deleteTemplate(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.checklistService.deleteTemplate(
      id,
      req.user.organizationId,
      req.user.sub,
    );
  }
}
