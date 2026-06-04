import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'ADMIN' },
    { name: 'MAINTENANCE_MANAGER' },
    { name: 'SUPERVISOR' },
    { name: 'TECHNICIAN' },
    { name: 'INVENTORY_MANAGER' },
    { name: 'PURCHASE_MANAGER' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('Roles Upserted');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });