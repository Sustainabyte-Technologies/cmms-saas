import { PrismaClient, AssetStatus, WorkOrderPriority, WorkOrderStatus, WorkOrderType, PMFrequency, PMStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up existing database...');

  // Deletions in correct order of dependency
  await prisma.activityLog.deleteMany({});
  await prisma.workOrderActivity.deleteMany({});
  await prisma.workOrderComment.deleteMany({});
  await prisma.workOrderAttachment.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.preventiveMaintenance.deleteMany({});
  await prisma.checklistTemplateItem.deleteMany({});
  await prisma.checklistTemplate.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.system.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.site.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('✅ Database cleaned. Seeding data...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Fixbyte Technologies',
    },
  });
  console.log(`🏢 Created Organization: ${org.name} (${org.id})`);

  // 2. Create Roles
  const roles = [
    { name: 'ADMIN', description: 'System Administrator with full access' },
    { name: 'CUSTOMER_MANAGER', description: 'Manages customers and assigned sites' },
    { name: 'SITE_INCHARGE', description: 'In-charge of specific site operations' },
    { name: 'SUPERVISOR', description: 'Supervises maintenance work and technicians' },
    { name: 'TECHNICIAN', description: 'Executes maintenance jobs and work orders' },
    { name: 'INVENTORY_MANAGER', description: 'Manages stock and spare parts' },
    { name: 'PURCHASE_MANAGER', description: 'Manages purchase requests and orders' },
  ];

  const dbRoles: Record<string, any> = {};
  for (const r of roles) {
    const createdRole = await prisma.role.create({
      data: r,
    });
    dbRoles[r.name] = createdRole;
  }
  console.log('🔑 Roles seeded successfully!');

  // 3. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin User (dharunk026 as requested in context)
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'dharunk026',
      email: 'admin@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567890',
      organizationId: org.id,
      roleId: dbRoles['ADMIN'].id,
    },
  });

  // Customer Manager
  const cmUser = await prisma.user.create({
    data: {
      fullName: 'John CM',
      email: 'cm@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567891',
      organizationId: org.id,
      roleId: dbRoles['CUSTOMER_MANAGER'].id,
      createdById: adminUser.id,
    },
  });

  // Site In-Charge
  const siUser = await prisma.user.create({
    data: {
      fullName: 'Jane SiteIncharge',
      email: 'si@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567892',
      organizationId: org.id,
      roleId: dbRoles['SITE_INCHARGE'].id,
      createdById: adminUser.id,
    },
  });

  // Supervisor
  const supervisorUser = await prisma.user.create({
    data: {
      fullName: 'Bob Supervisor',
      email: 'supervisor@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567893',
      organizationId: org.id,
      roleId: dbRoles['SUPERVISOR'].id,
      createdById: adminUser.id,
    },
  });

  // Technicians (Creating two for better load testing)
  const techUser1 = await prisma.user.create({
    data: {
      fullName: 'Alice Technician',
      email: 'tech1@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567894',
      organizationId: org.id,
      roleId: dbRoles['TECHNICIAN'].id,
      createdById: adminUser.id,
    },
  });

  const techUser2 = await prisma.user.create({
    data: {
      fullName: 'Charlie Technician',
      email: 'tech2@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567895',
      organizationId: org.id,
      roleId: dbRoles['TECHNICIAN'].id,
      createdById: adminUser.id,
    },
  });

  // Inventory Manager
  const imUser = await prisma.user.create({
    data: {
      fullName: 'Emily Inventory',
      email: 'im@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567896',
      organizationId: org.id,
      roleId: dbRoles['INVENTORY_MANAGER'].id,
      createdById: adminUser.id,
    },
  });

  // Purchase Manager
  const pmUser = await prisma.user.create({
    data: {
      fullName: 'David Purchase',
      email: 'pm@fixbyte.com',
      passwordHash,
      phoneNumber: '+1234567897',
      organizationId: org.id,
      roleId: dbRoles['PURCHASE_MANAGER'].id,
      createdById: adminUser.id,
    },
  });

  console.log('👥 Users seeded successfully!');

  // 4. Create Customers
  const customer = await prisma.customer.create({
    data: {
      name: 'Acme Corporates',
      code: 'ACME',
      description: 'Primary tenant and customer account',
      address: '100 Innovation Way',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      email: 'contact@acme.com',
      phone: '+18885552263',
      organizationId: org.id,
      assignedManagerId: cmUser.id,
      createdById: adminUser.id,
    },
  });

  // 5. Create Sites
  const site = await prisma.site.create({
    data: {
      name: 'Acme Boston HQ',
      code: 'BOS-HQ',
      address: '100 Innovation Way',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      customerId: customer.id,
      organizationId: org.id,
      assignedSupervisorId: siUser.id,
      createdById: adminUser.id,
    },
  });

  // 6. Create Departments
  const department = await prisma.department.create({
    data: {
      name: 'Engineering & Maintenance',
      code: 'ENG-MAIN',
      description: 'Facilities management and central plant engineering department',
      siteId: site.id,
      organizationId: org.id,
      assignedSupervisorId: supervisorUser.id,
      createdById: adminUser.id,
    },
  });

  // 7. Create Systems
  const sys = await prisma.system.create({
    data: {
      name: 'HVAC & Central Plant',
      code: 'HVAC-MAIN',
      description: 'Heating, Ventilation, Air Conditioning, and Chilled Water central plant system',
      departmentId: department.id,
      organizationId: org.id,
      createdById: adminUser.id,
    },
  });

  console.log('🏢 Customer, Site, Dept, System hierarchy seeded!');

  // 8. Create Assets
  const asset1 = await prisma.asset.create({
    data: {
      assetCode: 'CH-001',
      assetName: 'Centrifugal Chiller 400TR',
      category: 'HVAC',
      status: AssetStatus.ACTIVE,
      manufacturer: 'Carrier',
      modelNumber: '19XR',
      serialNumber: 'CAR20260601',
      location: 'Roof Plant Room A',
      capacity: '400 TR',
      powerRating: '320 kW',
      description: 'Central plant primary cooling unit',
      organizationId: org.id,
      createdById: adminUser.id,
      customerId: customer.id,
      siteId: site.id,
      departmentId: department.id,
      systemId: sys.id,
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      assetCode: 'DB-MAIN',
      assetName: 'Main Electrical Distribution Board',
      category: 'Electrical',
      status: AssetStatus.ACTIVE,
      manufacturer: 'Schneider Electric',
      modelNumber: 'PrismaSeT',
      serialNumber: 'SCH20260199',
      location: 'Ground Floor Substation',
      powerRating: '1600 A',
      description: 'Main incoming utility electrical feeder distribution panel',
      organizationId: org.id,
      createdById: adminUser.id,
      customerId: customer.id,
      siteId: site.id,
      departmentId: department.id,
      systemId: sys.id,
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      assetCode: 'BL-MECH',
      assetName: 'Gas-Fired Steam Boiler',
      category: 'Mechanical',
      status: AssetStatus.UNDER_MAINTENANCE,
      manufacturer: 'Cleaver-Brooks',
      modelNumber: 'CB-700',
      serialNumber: 'CB2026888',
      location: 'Boiler Room Annex',
      capacity: '100 HP',
      description: 'Primary steam and hot water generation boiler',
      organizationId: org.id,
      createdById: adminUser.id,
      customerId: customer.id,
      siteId: site.id,
      departmentId: department.id,
      systemId: sys.id,
    },
  });

  console.log('🔌 Assets seeded!');

  // 9. Create Checklist Templates
  const checklist = await prisma.checklistTemplate.create({
    data: {
      name: 'HVAC Maintenance Inspection Checklist',
      description: 'Routine maintenance checklist for checking refrigeration, electrical controls, and mechanical parts of chillers.',
      organizationId: org.id,
      items: {
        create: [
          { title: 'Check refrigerant pressure levels', isRequired: true, sortOrder: 1 },
          { title: 'Inspect electrical contactors & tighten terminals', isRequired: true, sortOrder: 2 },
          { title: 'Clean/backwash condenser water strainers', isRequired: true, sortOrder: 3 },
          { title: 'Measure and record compressor motor current draw', isRequired: true, sortOrder: 4 },
        ],
      },
    },
  });

  // 10. Create Preventive Maintenance Plan
  const pmPlan = await prisma.preventiveMaintenance.create({
    data: {
      pmNumber: 'PM-2026-CHILLER',
      title: 'Quarterly Chiller Maintenance Service',
      description: 'Execute standard manufacturer quarterly maintenance procedures on Chiller CH-001.',
      frequency: PMFrequency.QUARTERLY,
      startDate: new Date(),
      nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: PMStatus.ACTIVE,
      organizationId: org.id,
      assetId: asset1.id,
      checklistTemplateId: checklist.id,
      assignedTechnicianId: techUser1.id,
      priority: WorkOrderPriority.HIGH,
      estimatedHours: 4.5,
      createdById: adminUser.id,
    },
  });

  console.log('📋 Checklist and PM Plans seeded!');

  // 11. Create Work Orders (Mix of reactive/preventive, different statuses)
  // WO 1: Open, High, Reactive
  const wo1 = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-2026-0001',
      title: 'Steam leak detected near primary output manifold',
      description: 'Technician reported high pressure steam hissing out of the flange connecting to the primary distributor. Restrict area.',
      category: 'Mechanical',
      priority: WorkOrderPriority.HIGH,
      status: WorkOrderStatus.OPEN,
      workType: WorkOrderType.REACTIVE,
      estimatedHours: 3.0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      breakdownStartedAt: new Date(),
      location: 'Boiler Room Annex',
      organizationId: org.id,
      assetId: asset3.id,
      createdById: supervisorUser.id,
      assignedTechnicianId: techUser1.id,
    },
  });

  // WO 2: In Progress, Critical, Breakdown
  const wo2 = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-2026-0002',
      title: 'Primary Chiller Tripped on High Oil Temp',
      description: 'Chiller unit CH-001 has tripped. High alarm indicator on the controller screen. Critical load at risk.',
      category: 'HVAC',
      priority: WorkOrderPriority.CRITICAL,
      status: WorkOrderStatus.IN_PROGRESS,
      workType: WorkOrderType.BREAKDOWN,
      estimatedHours: 5.0,
      dueDate: new Date(), // Due today
      breakdownStartedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: 'Roof Plant Room A',
      organizationId: org.id,
      assetId: asset1.id,
      createdById: supervisorUser.id,
      assignedTechnicianId: techUser1.id,
    },
  });

  // WO 3: Assigned, Medium, Preventive (tied to PM plan)
  const wo3 = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-2026-0003',
      title: 'Quarterly Chiller Maintenance Service Job',
      description: 'Complete quarterly service checklist items.',
      category: 'HVAC',
      priority: WorkOrderPriority.MEDIUM,
      status: WorkOrderStatus.ASSIGNED,
      workType: WorkOrderType.PREVENTIVE,
      estimatedHours: 4.5,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Roof Plant Room A',
      checklistTemplateId: checklist.id,
      preventiveMaintenanceId: pmPlan.id,
      organizationId: org.id,
      assetId: asset1.id,
      createdById: adminUser.id,
      assignedTechnicianId: techUser2.id,
    },
  });

  // WO 4: Completed, Low, Reactive
  const wo4 = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-2026-0004',
      title: 'Substation indicator lamp replacement',
      description: 'L3 Phase light indicator is burnt out on the main incoming electrical feeder.',
      category: 'Electrical',
      priority: WorkOrderPriority.LOW,
      status: WorkOrderStatus.COMPLETED,
      workType: WorkOrderType.REACTIVE,
      estimatedHours: 1.0,
      actualHours: 0.8,
      startDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolutionNotes: 'Replaced 24V LED indicator bulb. Tested correct operation.',
      location: 'Ground Floor Substation',
      organizationId: org.id,
      assetId: asset2.id,
      createdById: supervisorUser.id,
      assignedTechnicianId: techUser2.id,
    },
  });

  console.log('🔧 Work Orders seeded!');

  // 12. Create Work Order Activities & Logs
  await prisma.workOrderActivity.create({
    data: {
      workOrderId: wo2.id,
      action: 'WORK_STARTED',
      remarks: 'Began diagnostics of temp sensor and lubricating oil level.',
      performedById: techUser1.id,
    },
  });

  await prisma.workOrderActivity.create({
    data: {
      workOrderId: wo4.id,
      action: 'WORK_COMPLETED',
      remarks: 'Bulb replaced and feeder panel lights verified.',
      performedById: techUser2.id,
    },
  });

  // 13. Create Activity Logs (so recent activities are populated)
  const logs = [
    { action: 'CREATE_USER', entityType: 'User', entityId: adminUser.id, entityName: adminUser.fullName, performedById: adminUser.id },
    { action: 'CREATE_CUSTOMER', entityType: 'Customer', entityId: customer.id, entityName: customer.name, performedById: adminUser.id },
    { action: 'CREATE_ASSET', entityType: 'Asset', entityId: asset1.id, entityName: asset1.assetName, performedById: adminUser.id },
    { action: 'ASSIGN_WORK_ORDER', entityType: 'WorkOrder', entityId: wo1.id, entityName: wo1.workOrderNumber, performedById: supervisorUser.id },
    { action: 'START_WORK_ORDER', entityType: 'WorkOrder', entityId: wo2.id, entityName: wo2.workOrderNumber, performedById: techUser1.id },
  ];

  for (const log of logs) {
    await prisma.activityLog.create({
      data: {
        organizationId: org.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        entityName: log.entityName,
        performedById: log.performedById,
      },
    });
  }

  console.log('📝 Activity Logs seeded!');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });