import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'MAINTENANCE_MANAGER' },
      { name: 'SUPERVISOR' },
      { name: 'TECHNICIAN' },
      { name: 'INVENTORY_MANAGER' },
      { name: 'PURCHASE_MANAGER' },
    ],
  });

  console.log('Roles Inserted');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });