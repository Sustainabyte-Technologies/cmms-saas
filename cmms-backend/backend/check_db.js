"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const count = await prisma.workOrder.count();
    console.log(`Total work orders in DB: ${count}`);
    const workOrders = await prisma.workOrder.findMany({
        select: {
            id: true,
            workOrderNumber: true,
            status: true,
            organizationId: true,
            assignedTechnicianId: true,
        }
    });
    console.log('Work Orders:', JSON.stringify(workOrders, null, 2));
    const orgs = await prisma.organization.findMany();
    console.log('Organizations:', JSON.stringify(orgs, null, 2));
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            fullName: true,
            organizationId: true,
            role: {
                select: {
                    name: true
                }
            }
        }
    });
    console.log('Users:', JSON.stringify(users, null, 2));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check_db.js.map