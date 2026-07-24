import {
  PrismaClient,
  AssetStatus,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkOrderType,
  PMFrequency,
  PMStatus,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up existing database...');

  // Deletions in correct order of dependency
  await prisma.activityLog.deleteMany({});
  await prisma.workOrderActivity.deleteMany({});
  await prisma.workOrderComment.deleteMany({});
  await prisma.workOrderAttachment.deleteMany({});
  try { await (prisma as any).chatMessage?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).workOrderChatMessage?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).purchaseOrderItem?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).purchaseOrder?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).purchaseRequestItem?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).purchaseRequest?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).vendor?.deleteMany({}); } catch (e) {}
  await prisma.partsRequest.deleteMany({});
  await prisma.stockTransaction.deleteMany({});
  await prisma.sparePart.deleteMany({});
  await prisma.sparePartCategory.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.serviceTicket.deleteMany({});
  try { await (prisma as any).rcmAnalysis?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).fmecaAssessment?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).rootCauseAnalysis?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).failureHistory?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).failureLibrary?.deleteMany({}); } catch (e) {}
  try { await (prisma as any).assetCriticality?.deleteMany({}); } catch (e) {}
  await prisma.incident.deleteMany({});
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

  console.log('✅ Database cleaned. Seeding enterprise demo data...');

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
    { name: 'SAFETY_OFFICER', description: 'Oversees safety and environmental incidents' },
    { name: 'STORE_KEEPER', description: 'Manages warehouse storage and issuing' },
  ];

  const dbRoles: Record<string, any> = {};
  for (const r of roles) {
    const createdRole = await prisma.role.create({
      data: r,
    });
    dbRoles[r.name] = createdRole;
  }
  console.log('🔑 Roles seeded successfully!');

  // 3. Create Users (~20 Users)
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'dharunk026',
      email: 'admin@fixbyte.com',
      passwordHash,
      phoneNumber: '+919876543210',
      organizationId: org.id,
      roleId: dbRoles['ADMIN'].id,
    },
  });

  const usersData = [
    // Customer Managers (2)
    { fullName: 'John CM', email: 'cm@fixbyte.com', role: 'CUSTOMER_MANAGER', phone: '+919876543211' },
    { fullName: 'Sarah CM', email: 'sarah.cm@fixbyte.com', role: 'CUSTOMER_MANAGER', phone: '+919876543212' },
    // Site Incharges (2)
    { fullName: 'Jane SiteIncharge', email: 'si@fixbyte.com', role: 'SITE_INCHARGE', phone: '+919876543213' },
    { fullName: 'Mark SiteIncharge', email: 'mark.si@fixbyte.com', role: 'SITE_INCHARGE', phone: '+919876543214' },
    // Supervisors (3)
    { fullName: 'Bob Supervisor', email: 'supervisor@fixbyte.com', role: 'SUPERVISOR', phone: '+919876543215' },
    { fullName: 'David Supervisor', email: 'david.sup@fixbyte.com', role: 'SUPERVISOR', phone: '+919876543216' },
    { fullName: 'Michael Supervisor', email: 'michael.sup@fixbyte.com', role: 'SUPERVISOR', phone: '+919876543217' },
    // Technicians (6)
    { fullName: 'Alice Technician', email: 'tech1@fixbyte.com', role: 'TECHNICIAN', phone: '+919876543218' },
    { fullName: 'Charlie Technician', email: 'tech2@fixbyte.com', role: 'TECHNICIAN', phone: '+919876543219' },
    { fullName: 'Daniel Tech', email: 'tech3@fixbyte.com', role: 'TECHNICIAN', phone: '+919876543220' },
    { fullName: 'Eva Tech', email: 'tech4@fixbyte.com', role: 'TECHNICIAN', phone: '+919876543221' },
    { fullName: 'Frank Tech', email: 'tech5@fixbyte.com', role: 'TECHNICIAN', phone: '+919876543222' },
    { fullName: 'George Tech', email: 'tech6@fixbyte.com', role: 'TECHNICIAN', phone: '+919876543223' },
    // Inventory Managers (2)
    { fullName: 'Emily Inventory', email: 'im@fixbyte.com', role: 'INVENTORY_MANAGER', phone: '+919876543224' },
    { fullName: 'James Inventory', email: 'james.im@fixbyte.com', role: 'INVENTORY_MANAGER', phone: '+919876543225' },
    // Purchase Managers (2)
    { fullName: 'David Purchase', email: 'pm@fixbyte.com', role: 'PURCHASE_MANAGER', phone: '+919876543226' },
    { fullName: 'Robert Purchase', email: 'robert.pm@fixbyte.com', role: 'PURCHASE_MANAGER', phone: '+919876543227' },
    // Safety Officer (1)
    { fullName: 'Alex Safety', email: 'safety@fixbyte.com', role: 'SAFETY_OFFICER', phone: '+919876543228' },
    // Store Keeper (1)
    { fullName: 'Sam Storekeeper', email: 'store@fixbyte.com', role: 'STORE_KEEPER', phone: '+919876543229' },
  ];

  const dbUsers: any[] = [adminUser];
  for (const u of usersData) {
    const userObj = await prisma.user.create({
      data: {
        fullName: u.fullName,
        email: u.email,
        passwordHash,
        phoneNumber: u.phone,
        organizationId: org.id,
        roleId: dbRoles[u.role].id,
        createdById: adminUser.id,
      },
    });
    dbUsers.push(userObj);
  }
  console.log(`👥 Seeded ${dbUsers.length} Users successfully!`);

  const technicians = dbUsers.filter((u) => {
    const r = Object.keys(dbRoles).find((key) => dbRoles[key].id === u.roleId);
    return r === 'TECHNICIAN';
  });
  const supervisors = dbUsers.filter((u) => {
    const r = Object.keys(dbRoles).find((key) => dbRoles[key].id === u.roleId);
    return r === 'SUPERVISOR';
  });

  // 4. Create Customers (5)
  const customerConfigs = [
    { name: 'ABC Manufacturing', code: 'ABC-MFG', city: 'Chennai', desc: 'Heavy automotive components manufacturing' },
    { name: 'TVS Motors', code: 'TVS-MOT', city: 'Hosur', desc: 'Two-wheeler and commercial vehicle plants' },
    { name: 'Ashok Leyland', code: 'ASH-LEY', city: 'Ennore', desc: 'Commercial vehicle & truck assembly plants' },
    { name: 'L&T Heavy Engineering', code: 'LNT-ENG', city: 'Hazira', desc: 'Defense, nuclear, and process equipment manufacturing' },
    { name: 'TATA Steel', code: 'TAT-STL', city: 'Jamshedpur', desc: 'Integrated steel processing and rolling mills' },
  ];

  const dbCustomers: any[] = [];
  for (const c of customerConfigs) {
    const cust = await prisma.customer.create({
      data: {
        name: c.name,
        code: c.code,
        description: c.desc,
        city: c.city,
        state: 'TN / GJ / JH',
        country: 'India',
        email: `contact@${c.code.toLowerCase()}.com`,
        phone: '+914428001100',
        organizationId: org.id,
        assignedManagerId: dbUsers[1].id,
        createdById: adminUser.id,
      },
    });
    dbCustomers.push(cust);
  }
  console.log(`🏭 Seeded ${dbCustomers.length} Customers!`);

  // 5. Create Sites (2 Sites per Customer = 10 Sites)
  const siteConfigs = [
    { name: 'Chennai Plant Unit 1', code: 'CHN-P1', city: 'Chennai' },
    { name: 'Coimbatore Foundry', code: 'CBE-F1', city: 'Coimbatore' },
    { name: 'Hosur Assembly Line', code: 'HOS-AL1', city: 'Hosur' },
    { name: 'Mysuru Engine Plant', code: 'MYS-EP1', city: 'Mysuru' },
    { name: 'Ennore Foundry Works', code: 'ENN-FW', city: 'Chennai' },
    { name: 'Pantnagar Truck Unit', code: 'PNT-TU', city: 'Pantnagar' },
    { name: 'Hazira Heavy Works', code: 'HAZ-HW', city: 'Hazira' },
    { name: 'Kanchipuram Modular Unit', code: 'KNC-MU', city: 'Kanchipuram' },
    { name: 'Jamshedpur Steel Plant', code: 'JAM-SP', city: 'Jamshedpur' },
    { name: 'Kalinganagar Cold Mill', code: 'KLN-CM', city: 'Kalinganagar' },
  ];

  const dbSites: any[] = [];
  for (let i = 0; i < siteConfigs.length; i++) {
    const sc = siteConfigs[i];
    const parentCustomer = dbCustomers[Math.floor(i / 2)];
    const siteObj = await prisma.site.create({
      data: {
        name: sc.name,
        code: sc.code,
        city: sc.city,
        state: 'India',
        country: 'India',
        customerId: parentCustomer.id,
        organizationId: org.id,
        assignedSupervisorId: dbUsers[3].id,
        createdById: adminUser.id,
      },
    });
    dbSites.push(siteObj);
  }
  console.log(`🌐 Seeded ${dbSites.length} Sites!`);

  // 6. Create Departments (5 Depts per Site = 50 Departments)
  const deptNames = [
    { name: 'Mechanical Maintenance', code: 'MECH' },
    { name: 'Electrical & Instrumentation', code: 'ELEC' },
    { name: 'Production & Assembly', code: 'PROD' },
    { name: 'Central Utilities', code: 'UTIL' },
    { name: 'Quality & Safety', code: 'QUAL' },
  ];

  const dbDepartments: any[] = [];
  for (const siteItem of dbSites) {
    for (const d of deptNames) {
      const deptObj = await prisma.department.create({
        data: {
          name: `${d.name} (${siteItem.code})`,
          code: `${d.code}-${siteItem.code}`,
          description: `${d.name} department located at ${siteItem.name}`,
          siteId: siteItem.id,
          organizationId: org.id,
          assignedSupervisorId: supervisors[dbDepartments.length % supervisors.length].id,
          createdById: adminUser.id,
        },
      });
      dbDepartments.push(deptObj);
    }
  }
  console.log(`🏬 Seeded ${dbDepartments.length} Departments!`);

  // 7. Create Systems (50 Systems under Departments)
  const systemTemplates = [
    { name: 'HVAC & Climate Control', code: 'HVAC' },
    { name: 'Boiler & Steam Generation', code: 'BOILER' },
    { name: 'DG & Emergency Power System', code: 'DG-PWR' },
    { name: 'Compressed Air Utility', code: 'AIR-COMP' },
    { name: 'Cooling Water Loop', code: 'COOL-TWR' },
  ];

  const dbSystems: any[] = [];
  for (let i = 0; i < dbDepartments.length; i++) {
    const deptItem = dbDepartments[i];
    const sysTpl = systemTemplates[i % systemTemplates.length];
    const sysObj = await prisma.system.create({
      data: {
        name: `${sysTpl.name} ${deptItem.code}`,
        code: `${sysTpl.code}-${deptItem.code}`,
        description: `Primary ${sysTpl.name} installed at ${deptItem.name}`,
        departmentId: deptItem.id,
        organizationId: org.id,
        createdById: adminUser.id,
      },
    });
    dbSystems.push(sysObj);
  }
  console.log(`⚙️ Seeded ${dbSystems.length} Systems!`);

  // 8. Create Assets (65 Assets)
  const assetTypes = [
    { name: 'Centrifugal Water Pump 50HP', cat: 'Mechanical', cap: '500 GPM', pwr: '37 kW', mfr: 'Grundfos' },
    { name: '3-Phase Induction Motor 75kW', cat: 'Electrical', cap: '1480 RPM', pwr: '75 kW', mfr: 'Siemens' },
    { name: 'High-Pressure Steam Boiler 200HP', cat: 'Boiler', cap: '200 HP', pwr: '150 kW', mfr: 'Cleaver-Brooks' },
    { name: 'Diesel Generator Set 1000kVA', cat: 'Power', cap: '1000 kVA', pwr: '800 kW', mfr: 'Cummins' },
    { name: 'Induced Draft Cooling Tower 500TR', cat: 'HVAC', cap: '500 TR', pwr: '45 kW', mfr: 'Marley' },
    { name: 'Air Handling Unit 15000 CFM', cat: 'HVAC', cap: '15000 CFM', pwr: '22 kW', mfr: 'Carrier' },
    { name: 'Double Girder Overhead Crane 20T', cat: 'Mechanical', cap: '20 Ton', pwr: '30 kW', mfr: 'Demag' },
    { name: 'Online Double Conversion UPS 200kVA', cat: 'Electrical', cap: '200 kVA', pwr: '180 kW', mfr: 'Schneider Electric' },
    { name: 'Step-Down Power Transformer 11kV/415V', cat: 'Electrical', cap: '2.5 MVA', pwr: '2500 kVA', mfr: 'ABB' },
    { name: 'Heavy Belt Conveyor Line 100M', cat: 'Production', cap: '200 TPH', pwr: '55 kW', mfr: 'Rexnord' },
    { name: 'Rotary Screw Air Compressor 100HP', cat: 'Compressed Air', cap: '450 CFM', pwr: '75 kW', mfr: 'Atlas Copco' },
    { name: 'Main Low Voltage Switchgear Panel', cat: 'Electrical', cap: '3200 A', pwr: '415 V', mfr: 'Eaton' },
    { name: 'Diesel Fire Hydrant Pump System', cat: 'Safety', cap: '2500 GPM', pwr: '110 kW', mfr: 'Kirloskar' },
  ];

  const statuses: AssetStatus[] = [
    AssetStatus.ACTIVE,
    AssetStatus.ACTIVE,
    AssetStatus.ACTIVE,
    AssetStatus.UNDER_MAINTENANCE,
    AssetStatus.BREAKDOWN,
    AssetStatus.IDLE,
  ];

  const dbAssets: any[] = [];
  for (let i = 1; i <= 65; i++) {
    const tpl = assetTypes[(i - 1) % assetTypes.length];
    const dept = dbDepartments[(i - 1) % dbDepartments.length];
    const sys = dbSystems[(i - 1) % dbSystems.length];
    const st = dbSites.find((s) => s.id === dept.siteId) || dbSites[0];
    const cust = dbCustomers.find((c) => c.id === st.customerId) || dbCustomers[0];
    const status = statuses[i % statuses.length];

    const assetObj = await prisma.asset.create({
      data: {
        assetCode: `AST-${i.toString().padStart(4, '0')}`,
        assetName: `${tpl.name} #${i}`,
        category: tpl.cat,
        status,
        manufacturer: tpl.mfr,
        modelNumber: `MOD-2026-${100 + i}`,
        serialNumber: `SN-FXB-${10000 + i}`,
        location: `Bay ${(i % 8) + 1}, Floor ${(i % 3) + 1}`,
        capacity: tpl.cap,
        powerRating: tpl.pwr,
        description: `High-performance ${tpl.name} deployed in ${dept.name}`,
        organizationId: org.id,
        createdById: adminUser.id,
        customerId: cust.id,
        siteId: st.id,
        departmentId: dept.id,
        systemId: sys.id,
      },
    });
    dbAssets.push(assetObj);
  }
  console.log(`🔌 Seeded ${dbAssets.length} Assets with full status distribution!`);

  // 9. Create Checklist Templates (10 Templates)
  const checklistData = [
    {
      name: 'HVAC Chiller & AHU Routine Inspection',
      items: [
        'Inspect refrigerant suction and discharge pressures',
        'Check compressor oil level and clarity',
        'Inspect air filter cleanliness on AHU',
        'Check motor belt tension and alignment',
        'Verify thermostat and chilled water setpoints',
      ],
    },
    {
      name: 'Electrical Transformer & Substation Checklist',
      items: [
        'Inspect oil level in transformer conservator tank',
        'Check winding and oil temperature gauges',
        'Inspect silica gel breather condition',
        'Verify earth pit resistance values',
        'Check switchgear circuit breaker status and indicator lamps',
      ],
    },
    {
      name: 'Boiler & Steam Pressure System Check',
      items: [
        'Check steam pressure gauge and safety relief valve',
        'Blowdown boiler water gauge glass',
        'Inspect burner flame color and fuel pressure',
        'Check feedwater pump operation and water level',
        'Test automatic low water cutoff mechanism',
      ],
    },
    {
      name: 'Air Compressor & Receiver Tank Audit',
      items: [
        'Drain moisture condensate from air receiver tank',
        'Check compressor intake air filter',
        'Inspect oil separator element delta P',
        'Check discharge air pressure and temperature',
        'Verify auto-drain solenoid valve cycling',
      ],
    },
    {
      name: 'Diesel Generator Weekly Operational Inspection',
      items: [
        'Check engine lube oil level and coolant level',
        'Inspect starter battery voltage and terminal tightness',
        'Check diesel fuel day-tank level',
        'Run DG set on no-load test for 10 minutes',
        'Inspect exhaust pipe connection for leaks',
      ],
    },
    {
      name: 'Centrifugal Pump & Piping Maintenance',
      items: [
        'Inspect mechanical seal / gland packing leak rate',
        'Check pump and motor bearing vibration levels',
        'Inspect coupling alignment and guard condition',
        'Measure motor operating current and voltage',
        'Clean suction Y-strainer screen',
      ],
    },
    {
      name: 'Conveyor Line Mechanical & Gearbox Audit',
      items: [
        'Inspect conveyor belt tension and tracking',
        'Check drive gearbox oil level and temperature',
        'Inspect tail pulley and drive sprocket teeth',
        'Check emergency pull-cord safety switch',
        'Lubricate head and tail roller bearings',
      ],
    },
    {
      name: 'Fire Fighting Pump & Alarm System Test',
      items: [
        'Check main fire pump diesel and electric starter panel',
        'Test automatic pressure switch start trigger',
        'Inspect jockey pump cut-in / cut-out pressures',
        'Check fire main pressure gauge reading (Min 7 bar)',
        'Inspect hose reel valves and nozzle condition',
      ],
    },
    {
      name: 'Water Treatment Plant & RO Filter Inspection',
      items: [
        'Check raw water inlet TDS and pH',
        'Inspect RO membrane differential pressure',
        'Check dosing chemical tank levels (Chlorine/Antiscalant)',
        'Backwash sand filter and activated carbon filter',
        'Verify treated water storage level sensor',
      ],
    },
    {
      name: 'Plant Lighting & Emergency Power System Check',
      items: [
        'Inspect main high-bay LED fixture illumination',
        'Test emergency exit sign battery backup units',
        'Inspect distribution board MCB/ELCB trip buttons',
        'Verify automatic transfer switch (ATS) indicator lights',
        'Clean light reflector shades in main bay',
      ],
    },
  ];

  const dbChecklists: any[] = [];
  for (const c of checklistData) {
    const clObj = await prisma.checklistTemplate.create({
      data: {
        name: c.name,
        description: `Standardized inspection procedure for ${c.name}`,
        organizationId: org.id,
        items: {
          create: c.items.map((itemTitle, idx) => ({
            title: itemTitle,
            isRequired: idx < 3,
            sortOrder: idx + 1,
          })),
        },
      },
    });
    dbChecklists.push(clObj);
  }
  console.log(`📋 Seeded ${dbChecklists.length} Checklist Templates!`);

  // 10. Create Preventive Maintenance Plans (20 Plans with realistic date calendar distribution)
  const frequencies: PMFrequency[] = [
    PMFrequency.DAILY,
    PMFrequency.WEEKLY,
    PMFrequency.MONTHLY,
    PMFrequency.QUARTERLY,
    PMFrequency.HALF_YEARLY,
    PMFrequency.YEARLY,
  ];

  const dbPMs: any[] = [];
  const now = new Date();

  for (let i = 1; i <= 20; i++) {
    const asset = dbAssets[(i - 1) % dbAssets.length];
    const checklist = dbChecklists[(i - 1) % dbChecklists.length];
    const tech = technicians[(i - 1) % technicians.length];
    const freq = frequencies[(i - 1) % frequencies.length];

    // Spread due dates realistically across calendar: Overdue (-5 days), Today (0), Tomorrow (+1), Next Week (+7), Next Month (+25)
    let daysOffset = 0;
    if (i % 6 === 0) daysOffset = -5; // Overdue
    else if (i % 6 === 1) daysOffset = 0; // Today
    else if (i % 6 === 2) daysOffset = 1; // Tomorrow
    else if (i % 6 === 3) daysOffset = 7; // Next Week
    else if (i % 6 === 4) daysOffset = 21; // Next Month
    else daysOffset = 45; // Future

    const nextDueDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);

    const pmObj = await prisma.preventiveMaintenance.create({
      data: {
        pmNumber: `PM-2026-${i.toString().padStart(4, '0')}`,
        title: `Preventive Maintenance for ${asset.assetName}`,
        description: `Scheduled ${freq.toLowerCase()} preventive maintenance service and safety audit.`,
        frequency: freq,
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        nextDueDate,
        status: PMStatus.ACTIVE,
        organizationId: org.id,
        assetId: asset.id,
        checklistTemplateId: checklist.id,
        assignedTechnicianId: tech.id,
        priority: i % 4 === 0 ? WorkOrderPriority.CRITICAL : i % 3 === 0 ? WorkOrderPriority.HIGH : WorkOrderPriority.MEDIUM,
        estimatedHours: 2.5 + (i % 4),
        createdById: adminUser.id,
      },
    });
    dbPMs.push(pmObj);
  }
  console.log(`📅 Seeded ${dbPMs.length} Preventive Maintenance Plans!`);

  // 11. Create Work Orders (50 Work Orders)
  const woTitles = [
    { title: 'Pump Seal Leakage and High Vibration', cat: 'Mechanical', type: WorkOrderType.REACTIVE },
    { title: 'Motor Bearing Temperature Exceeded Threshold', cat: 'Electrical', type: WorkOrderType.BREAKDOWN },
    { title: 'Electrical Distribution Board Thermography Inspection', cat: 'Electrical', type: WorkOrderType.INSPECTION },
    { title: 'Boiler Main Flange Steam Leakage', cat: 'Mechanical', type: WorkOrderType.BREAKDOWN },
    { title: 'Generator Engine Lube Oil & Filter Change', cat: 'Power', type: WorkOrderType.PREVENTIVE },
    { title: 'Cooling Tower Fan Belt Inspection & Replacement', cat: 'HVAC', type: WorkOrderType.PREVENTIVE },
    { title: 'Step-Down Transformer Oil Sampling & DGA Test', cat: 'Electrical', type: WorkOrderType.INSPECTION },
    { title: 'Conveyor Drive Chain Lubrication & Tensioning', cat: 'Production', type: WorkOrderType.PREVENTIVE },
    { title: 'Air Compressor Moisture Separator Trap Cleaning', cat: 'Compressed Air', type: WorkOrderType.PREVENTIVE },
    { title: 'Emergency Fire Pump Diesel Engine Crank Test', cat: 'Safety', type: WorkOrderType.INSPECTION },
  ];

  const woStatuses: WorkOrderStatus[] = [
    WorkOrderStatus.OPEN,
    WorkOrderStatus.ASSIGNED,
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.ON_HOLD,
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.CLOSED,
  ];

  const woPriorities: WorkOrderPriority[] = [
    WorkOrderPriority.LOW,
    WorkOrderPriority.MEDIUM,
    WorkOrderPriority.HIGH,
    WorkOrderPriority.CRITICAL,
  ];

  const dbWorkOrders: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const tpl = woTitles[(i - 1) % woTitles.length];
    const asset = dbAssets[(i - 1) % dbAssets.length];
    const tech = technicians[(i - 1) % technicians.length];
    const sup = supervisors[(i - 1) % supervisors.length];
    const status = woStatuses[i % woStatuses.length];
    const priority = woPriorities[i % woPriorities.length];

    const createdDaysAgo = (i % 15) + 1;
    const createdAt = new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(createdAt.getTime() + (2 + (i % 5)) * 24 * 60 * 60 * 1000);

    const isCompleted = status === WorkOrderStatus.COMPLETED || status === WorkOrderStatus.CLOSED;

    const woObj = await prisma.workOrder.create({
      data: {
        workOrderNumber: `WO-2026-${i.toString().padStart(4, '0')}`,
        title: `${tpl.title} - ${asset.assetCode}`,
        description: `Detailed task description for ${tpl.title} on asset ${asset.assetName}. Ensure safety protocol compliance before execution.`,
        category: tpl.cat,
        priority,
        status,
        workType: tpl.type,
        estimatedHours: 2.0 + (i % 5),
        actualHours: isCompleted ? 1.5 + (i % 4) : null,
        startDate: isCompleted || status === WorkOrderStatus.IN_PROGRESS ? createdAt : null,
        dueDate,
        resolutionNotes: isCompleted ? `Work executed successfully by ${tech.fullName}. All parameters restored to normal operating range.` : null,
        location: asset.location,
        organizationId: org.id,
        assetId: asset.id,
        createdById: sup.id,
        assignedTechnicianId: tech.id,
        createdAt,
      },
    });
    dbWorkOrders.push(woObj);

    if (i % 2 === 0) {
      await prisma.workOrderActivity.create({
        data: {
          workOrderId: woObj.id,
          action: isCompleted ? 'WORK_COMPLETED' : 'WORK_STARTED',
          remarks: isCompleted ? 'Task completed & verified' : 'Diagnostic work commenced on site',
          performedById: tech.id,
        },
      });
    }
  }
  console.log(`🔧 Seeded ${dbWorkOrders.length} Work Orders with activities!`);

  // 12. Create Incidents (20 Incidents)
  const incidentTitles = [
    { title: 'Worker slipped near Hydraulic Pump Unit', type: IncidentType.SAFETY, sev: IncidentSeverity.MEDIUM },
    { title: 'Transformer Oil Leakage near Substation B', type: IncidentType.ENVIRONMENTAL, sev: IncidentSeverity.HIGH },
    { title: 'Chemical Solvent Spill in Cleaning Bay', type: IncidentType.CHEMICAL, sev: IncidentSeverity.HIGH },
    { title: 'Near Miss: Crane Hook Flange Slip', type: IncidentType.NEAR_MISS, sev: IncidentSeverity.LOW },
    { title: 'Electrical Spark in Distribution Panel DB-3', type: IncidentType.ELECTRICAL, sev: IncidentSeverity.CRITICAL },
    { title: 'Fire Alarm Triggered in Warehouse Bay 2', type: IncidentType.FIRE, sev: IncidentSeverity.CRITICAL },
    { title: 'Chiller Motor Overheating & Vibration', type: IncidentType.OPERATIONAL, sev: IncidentSeverity.MEDIUM },
    { title: 'Gas Pipe Pressure Relief Valve Leakage', type: IncidentType.ENVIRONMENTAL, sev: IncidentSeverity.HIGH },
    { title: 'Overhead Water Line Burst in Maintenance Bay', type: IncidentType.PROPERTY_DAMAGE, sev: IncidentSeverity.MEDIUM },
    { title: 'Unintended Line Stop on Press Line 2', type: IncidentType.OPERATIONAL, sev: IncidentSeverity.LOW },
  ];

  const incidentStatuses: IncidentStatus[] = [
    IncidentStatus.OPEN,
    IncidentStatus.UNDER_INVESTIGATION,
    IncidentStatus.CORRECTIVE_ACTION,
    IncidentStatus.RESOLVED,
    IncidentStatus.CLOSED,
  ];

  const dbIncidents: any[] = [];
  for (let i = 1; i <= 20; i++) {
    const tpl = incidentTitles[(i - 1) % incidentTitles.length];
    const asset = dbAssets[(i - 1) % dbAssets.length];
    const reporter = dbUsers[i % dbUsers.length];
    const investigator = supervisors[i % supervisors.length];
    const status = incidentStatuses[i % incidentStatuses.length];

    const linkedWO = i <= 5 ? dbWorkOrders[i - 1] : null;

    const incObj = await prisma.incident.create({
      data: {
        incidentNumber: `INC-${i.toString().padStart(6, '0')}`,
        title: `${tpl.title} (#${i})`,
        description: `Detailed incident report regarding ${tpl.title}. Immediate corrective measures taken to secure the area.`,
        incidentType: tpl.type,
        severity: tpl.sev,
        status,
        incidentDate: new Date(now.getTime() - i * 12 * 60 * 60 * 1000),
        organizationId: org.id,
        customerId: asset.customerId,
        siteId: asset.siteId,
        departmentId: asset.departmentId,
        reportedById: reporter.id,
        assignedToId: investigator.id,
        location: asset.location,
        assetId: asset.id,
        workOrderId: linkedWO ? linkedWO.id : null,
        isWorkOrderCreated: !!linkedWO,
        rootCause: status === IncidentStatus.CLOSED || status === IncidentStatus.RESOLVED ? 'Component fatigue due to continuous operating cycle' : null,
        correctiveAction: status === IncidentStatus.CLOSED || status === IncidentStatus.RESOLVED ? 'Replaced worn seals and updated inspection frequency' : null,
        preventiveAction: status === IncidentStatus.CLOSED || status === IncidentStatus.RESOLVED ? 'Added monthly thermal imaging audit to PM schedule' : null,
        createdBy: adminUser.id,
      },
    });
    dbIncidents.push(incObj);
  }
  console.log(`🚨 Seeded ${dbIncidents.length} Incidents!`);

  // 13. Create Service Tickets (25 Service Tickets)
  const ticketTitles = [
    { title: 'AC Not Cooling in Main Control Room', cat: TicketCategory.HVAC, prio: TicketPriority.HIGH },
    { title: 'Workstation Printer Paper Jam & Error', cat: TicketCategory.IT_SUPPORT, prio: TicketPriority.LOW },
    { title: 'Operator Desk Chair Hydraulic Piston Fault', cat: TicketCategory.FACILITY, prio: TicketPriority.LOW },
    { title: 'Bay 3 Overhead Bay Lighting Fixture Out', cat: TicketCategory.ELECTRICAL, prio: TicketPriority.MEDIUM },
    { title: 'Restroom Water Tap Leakage', cat: TicketCategory.PLUMBING, prio: TicketPriority.MEDIUM },
    { title: 'Shift 2 Workshop Floor Deep Cleaning Request', cat: TicketCategory.HOUSEKEEPING, prio: TicketPriority.LOW },
    { title: 'Conference Room Projector Lamp Replacement', cat: TicketCategory.IT_SUPPORT, prio: TicketPriority.MEDIUM },
    { title: 'Emergency Exit Door Access Card Reader Unresponsive', cat: TicketCategory.ELECTRICAL, prio: TicketPriority.URGENT },
    { title: 'Tool Room Exhaust Fan Noise & Vibration', cat: TicketCategory.MECHANICAL, prio: TicketPriority.HIGH },
    { title: 'Department Office Wi-Fi Access Point Reset', cat: TicketCategory.IT_SUPPORT, prio: TicketPriority.LOW },
  ];

  const ticketStatuses: TicketStatus[] = [
    TicketStatus.NEW,
    TicketStatus.ASSIGNED,
    TicketStatus.IN_PROGRESS,
    TicketStatus.ON_HOLD,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ];

  const dbTickets: any[] = [];
  for (let i = 1; i <= 25; i++) {
    const tpl = ticketTitles[(i - 1) % ticketTitles.length];
    const asset = dbAssets[(i - 1) % dbAssets.length];
    const requester = dbUsers[i % dbUsers.length];
    const assignee = dbUsers[(i + 2) % dbUsers.length];
    const status = ticketStatuses[i % ticketStatuses.length];

    const linkedWO = i >= 6 && i <= 10 ? dbWorkOrders[i + 10] : null;

    const tktObj = await prisma.serviceTicket.create({
      data: {
        ticketNumber: `ST-${i.toString().padStart(6, '0')}`,
        title: `${tpl.title} (#${i})`,
        description: `Service request regarding ${tpl.title}. Please send a technician or maintenance personnel to inspect and fix.`,
        category: tpl.cat,
        priority: tpl.prio,
        status,
        requestDate: new Date(now.getTime() - i * 8 * 60 * 60 * 1000),
        organizationId: org.id,
        customerId: asset.customerId,
        siteId: asset.siteId,
        departmentId: asset.departmentId,
        requestedById: requester.id,
        assignedToId: assignee.id,
        assetId: asset.id,
        workOrderId: linkedWO ? linkedWO.id : null,
        isWorkOrderCreated: !!linkedWO,
        location: asset.location,
        resolution: status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED ? 'Issue inspected and fixed. Functionality verified.' : null,
        remarks: 'Processed via standard FixByte CMMS Service Ticket workflow.',
        createdBy: adminUser.id,
      },
    });
    dbTickets.push(tktObj);
  }
  console.log(`🎫 Seeded ${dbTickets.length} Service Tickets!`);

  // 14. Seed Reliability Module Data
  console.log('⚡ Seeding Reliability Module Data...');

  // Failure Library
  const failLib1 = await (prisma as any).failureLibrary.create({
    data: {
      organizationId: org.id,
      failureCode: 'FAIL-ELEC-001',
      failureMode: 'Motor Winding Overheating',
      description: 'Insulation degradation leading to thermal trip during peak load',
      failureCategory: 'Electrical',
      assetCategory: 'Motors & Drives',
      severity: 'HIGH',
      recommendedAction: 'Inspect stator insulation resistance (Megger test) and clean cooling fans',
      status: true,
    },
  });

  const failLib2 = await (prisma as any).failureLibrary.create({
    data: {
      organizationId: org.id,
      failureCode: 'FAIL-MECH-002',
      failureMode: 'Bearing Misalignment & Fatigue',
      description: 'Vibration-induced mechanical wear on drive shaft roller bearings',
      failureCategory: 'Mechanical',
      assetCategory: 'Pumps & Turbines',
      severity: 'CRITICAL',
      recommendedAction: 'Perform precision laser alignment and replace bearing housing grease',
      status: true,
    },
  });

  const failLib3 = await (prisma as any).failureLibrary.create({
    data: {
      organizationId: org.id,
      failureCode: 'FAIL-HVAC-003',
      failureMode: 'Refrigerant Leak & Pressure Drop',
      description: 'Micro-cracks in condenser copper tubing resulting in low suction pressure',
      failureCategory: 'HVAC',
      assetCategory: 'Chillers & HVAC',
      severity: 'MEDIUM',
      recommendedAction: 'Pressure test refrigerant circuit with Nitrogen and braze tubing joints',
      status: true,
    },
  });

  // Asset Criticality
  if (dbAssets.length > 0) {
    for (let i = 0; i < Math.min(10, dbAssets.length); i++) {
      const asset = dbAssets[i];
      const safety = (i % 5) + 1;
      const prod = ((i + 2) % 5) + 1;
      const fin = ((i + 1) % 5) + 1;
      const env = ((i + 3) % 5) + 1;
      const maint = ((i + 4) % 5) + 1;
      const score = safety + prod + fin + env + maint;
      let level = 'LOW';
      if (score >= 20) level = 'CRITICAL';
      else if (score >= 15) level = 'HIGH';
      else if (score >= 10) level = 'MEDIUM';

      await (prisma as any).assetCriticality.create({
        data: {
          organizationId: org.id,
          assetId: asset.id,
          customerId: dbCustomers[0]?.id,
          siteId: dbSites[0]?.id,
          departmentId: dbDepartments[0]?.id,
          safetyImpact: safety,
          productionImpact: prod,
          financialImpact: fin,
          environmentalImpact: env,
          maintenanceImpact: maint,
          criticalityScore: score,
          criticalityLevel: level,
          reviewNotes: `Annual criticality evaluation for ${asset.assetName}`,
          reviewedById: dbUsers[0]?.id,
        },
      });
    }
  }

  // Failure History
  if (dbAssets.length > 0) {
    for (let i = 0; i < Math.min(8, dbAssets.length); i++) {
      const asset = dbAssets[i];
      const wo = dbWorkOrders[i % dbWorkOrders.length];
      const start = new Date(now.getTime() - (i + 1) * 3 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + (i + 2) * 2 * 60 * 60 * 1000);
      const downtime = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      await (prisma as any).failureHistory.create({
        data: {
          organizationId: org.id,
          assetId: asset.id,
          workOrderId: wo?.id,
          failureModeId: i % 2 === 0 ? failLib1.id : failLib2.id,
          failureModeText: i % 2 === 0 ? failLib1.failureMode : failLib2.failureMode,
          failureCause: 'Thermal breakdown and lubricant starvation under continuous duty cycle',
          failureEffect: 'Line stoppage and temperature spike on secondary compression loop',
          breakdownStart: start,
          breakdownEnd: end,
          downtimeHours: Number(downtime.toFixed(2)),
          repairTimeHours: Number((downtime * 0.8).toFixed(2)),
          technicianId: dbUsers[i % dbUsers.length]?.id,
          supervisorId: dbUsers[0]?.id,
          repairCost: (i + 1) * 250,
        },
      });
    }
  }

  // RCA Cases
  if (dbAssets.length > 0) {
    const rcaStatuses = ['DRAFT', 'INVESTIGATING', 'ACTION_REQUIRED', 'CLOSED'];
    for (let i = 0; i < 4; i++) {
      const asset = dbAssets[i];
      const incident = dbIncidents[i % dbIncidents.length];

      await (prisma as any).rootCauseAnalysis.create({
        data: {
          organizationId: org.id,
          rcaNumber: `RCA-2026-000${i + 1}`,
          assetId: asset.id,
          incidentId: incident?.id,
          rootCause: 'Inadequate preventive maintenance frequency and delayed filter replacements',
          causeCategory: i % 2 === 0 ? 'Maintenance Procedure' : 'Component Wear',
          investigationNotes: 'Detailed 5-Why analysis conducted by Reliability engineering team',
          correctiveAction: 'Replaced damaged shaft seal and flushed hydraulic oil system',
          preventiveAction: 'Updated PM checklist interval from 30 days to bi-weekly inspection',
          investigatorId: dbUsers[i % dbUsers.length]?.id,
          status: rcaStatuses[i],
          closedAt: rcaStatuses[i] === 'CLOSED' ? new Date() : null,
        },
      });
    }
  }

  // FMECA Assessments
  if (dbAssets.length > 0) {
    for (let i = 0; i < Math.min(6, dbAssets.length); i++) {
      const asset = dbAssets[i];
      const sev = (i % 3) + 7; // 7 to 9
      const occ = (i % 4) + 4; // 4 to 7
      const det = (i % 3) + 5; // 5 to 7
      const rpn = sev * occ * det;
      let risk = 'MEDIUM';
      if (rpn >= 200) risk = 'CRITICAL';
      else if (rpn >= 120) risk = 'HIGH';

      await (prisma as any).fmecaAssessment.create({
        data: {
          organizationId: org.id,
          assetId: asset.id,
          failureModeId: failLib1.id,
          failureModeText: 'Bearing Overheating & Seizure',
          failureCause: 'Contaminated grease and shaft vibration',
          failureEffect: 'Impeller locking and motor overload trip',
          severity: sev,
          occurrence: occ,
          detection: det,
          rpn,
          riskRanking: risk,
          recommendedAction: 'Install continuous vibration monitoring sensors and automatic lube points',
        },
      });
    }
  }

  // RCM Analysis
  if (dbAssets.length > 0) {
    const strategies = ['PREVENTIVE_MAINTENANCE', 'PREDICTIVE_MAINTENANCE', 'CONDITION_MONITORING', 'INSPECTION', 'RUN_TO_FAILURE'];
    for (let i = 0; i < Math.min(5, dbAssets.length); i++) {
      const asset = dbAssets[i];
      await (prisma as any).rcmAnalysis.create({
        data: {
          organizationId: org.id,
          assetId: asset.id,
          assetFunction: 'Fluid circulation and continuous pressure maintenance across cooling tower circuit',
          functionalFailure: 'Failure to maintain minimum system pressure threshold of 4.5 bar',
          failureModeText: 'Pump impeller erosion and seal leakage',
          maintenanceStrategy: strategies[i],
          tasksDescription: 'Quarterly thermographic audit, vibration analysis, and mechanical seal inspection',
          intervalDays: 90,
        },
      });
    }
  }
  console.log('⚡ Reliability Module Data seeded!');

  // 15. Create Activity Logs (~220 Activity Logs)
  console.log('📝 Generating 220+ Activity Logs...');
  const actions = [
    'CREATE_USER', 'UPDATE_USER', 'CREATE_CUSTOMER', 'CREATE_SITE',
    'CREATE_ASSET', 'UPDATE_ASSET', 'CREATE_WORK_ORDER', 'ASSIGN_WORK_ORDER',
    'START_WORK_ORDER', 'COMPLETE_WORK_ORDER', 'CREATE_INCIDENT',
    'UPDATE_INCIDENT', 'CREATE_SERVICE_TICKET', 'RESOLVE_SERVICE_TICKET',
  ];

  for (let i = 1; i <= 220; i++) {
    const action = actions[i % actions.length];
    const performer = dbUsers[i % dbUsers.length];

    let entityType = 'WorkOrder';
    let entityId = dbWorkOrders[i % dbWorkOrders.length].id;
    let entityName = dbWorkOrders[i % dbWorkOrders.length].workOrderNumber;

    if (i % 4 === 1) {
      entityType = 'Asset';
      entityId = dbAssets[i % dbAssets.length].id;
      entityName = dbAssets[i % dbAssets.length].assetName;
    } else if (i % 4 === 2) {
      entityType = 'Incident';
      entityId = dbIncidents[i % dbIncidents.length].id;
      entityName = dbIncidents[i % dbIncidents.length].incidentNumber;
    } else if (i % 4 === 3) {
      entityType = 'ServiceTicket';
      entityId = dbTickets[i % dbTickets.length].id;
      entityName = dbTickets[i % dbTickets.length].ticketNumber;
    }

    await prisma.activityLog.create({
      data: {
        organizationId: org.id,
        action,
        entityType,
        entityId,
        entityName,
        performedById: performer.id,
        createdAt: new Date(now.getTime() - i * 2 * 60 * 60 * 1000),
      },
    });
  }
  console.log('📝 Activity Logs seeded!');

  console.log('----------------------------------------------------');
  console.log('🎉 Enterprise Data Seeding Completed Successfully!');
  console.log(`🏢 Organization: ${org.name}`);
  console.log(`👥 Users: ${dbUsers.length}`);
  console.log(`🏭 Customers: ${dbCustomers.length}`);
  console.log(`🌐 Sites: ${dbSites.length}`);
  console.log(`🏬 Departments: ${dbDepartments.length}`);
  console.log(`⚙️ Systems: ${dbSystems.length}`);
  console.log(`🔌 Assets: ${dbAssets.length}`);
  console.log(`📋 Checklist Templates: ${dbChecklists.length}`);
  console.log(`📅 PM Plans: ${dbPMs.length}`);
  console.log(`🔧 Work Orders: ${dbWorkOrders.length}`);
  console.log(`🚨 Incidents: ${dbIncidents.length}`);
  console.log(`🎫 Service Tickets: ${dbTickets.length}`);
  console.log('----------------------------------------------------');
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