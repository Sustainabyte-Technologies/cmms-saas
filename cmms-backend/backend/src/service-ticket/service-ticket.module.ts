import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceTicketController } from './controllers/service-ticket.controller';
import { ServiceTicketService } from './services/service-ticket.service';
import { ServiceTicketRepository } from './repositories/service-ticket.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceTicketController],
  providers: [ServiceTicketService, ServiceTicketRepository],
  exports: [ServiceTicketService, ServiceTicketRepository],
})
export class ServiceTicketModule {}
