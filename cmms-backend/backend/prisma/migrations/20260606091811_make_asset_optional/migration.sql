-- DropForeignKey
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_assetId_fkey";

-- AlterTable
ALTER TABLE "work_orders" ALTER COLUMN "assetId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
