-- AlterTable
ALTER TABLE "commandes" ADD COLUMN     "artisanId" INTEGER,
ADD COLUMN     "devisMessage" TEXT,
ADD COLUMN     "devisPrix" DECIMAL(10,2),
ADD COLUMN     "devisStatut" TEXT NOT NULL DEFAULT 'EN_ATTENTE';

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "artisans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
