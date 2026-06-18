/*
  Warnings:

  - You are about to drop the column `assignedSupervisorId` on the `work_orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_assignedSupervisorId_fkey";

-- AlterTable
ALTER TABLE "work_orders" DROP COLUMN "assignedSupervisorId",
ADD COLUMN     "location" TEXT;
