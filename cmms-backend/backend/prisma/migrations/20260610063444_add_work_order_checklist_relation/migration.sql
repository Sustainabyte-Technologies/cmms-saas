-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "checklistTemplateId" TEXT;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_checklistTemplateId_fkey" FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
