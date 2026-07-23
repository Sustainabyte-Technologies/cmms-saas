import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceTicketDto } from './create-service-ticket.dto';

export class UpdateServiceTicketDto extends PartialType(CreateServiceTicketDto) {}
