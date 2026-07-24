import { Module } from '@nestjs/common';
import { ReliabilityDashboardController } from './dashboard/dashboard.controller';
import { ReliabilityDashboardService } from './dashboard/dashboard.service';
import { ReliabilityCriticalityController } from './criticality/criticality.controller';
import { ReliabilityCriticalityService } from './criticality/criticality.service';
import { ReliabilityFailureLibraryController } from './failure-library/failure-library.controller';
import { ReliabilityFailureLibraryService } from './failure-library/failure-library.service';
import { ReliabilityFailureHistoryController } from './failure-history/failure-history.controller';
import { ReliabilityFailureHistoryService } from './failure-history/failure-history.service';
import { ReliabilityKpiController } from './kpi/kpi.controller';
import { ReliabilityKpiService } from './kpi/kpi.service';
import { ReliabilityRcaController } from './rca/rca.controller';
import { ReliabilityRcaService } from './rca/rca.service';
import { ReliabilityFmecaController } from './fmeca/fmeca.controller';
import { ReliabilityFmecaService } from './fmeca/fmeca.service';
import { ReliabilityRcmController } from './rcm/rcm.controller';
import { ReliabilityRcmService } from './rcm/rcm.service';
import { ReliabilityReportsController } from './reports/reports.controller';
import { ReliabilityReportsService } from './reports/reports.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ReliabilityDashboardController,
    ReliabilityCriticalityController,
    ReliabilityFailureLibraryController,
    ReliabilityFailureHistoryController,
    ReliabilityKpiController,
    ReliabilityRcaController,
    ReliabilityFmecaController,
    ReliabilityRcmController,
    ReliabilityReportsController,
  ],
  providers: [
    ReliabilityDashboardService,
    ReliabilityCriticalityService,
    ReliabilityFailureLibraryService,
    ReliabilityFailureHistoryService,
    ReliabilityKpiService,
    ReliabilityRcaService,
    ReliabilityFmecaService,
    ReliabilityRcmService,
    ReliabilityReportsService,
  ],
})
export class ReliabilityModule {}
