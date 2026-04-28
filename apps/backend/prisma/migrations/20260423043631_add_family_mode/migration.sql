/*
  Warnings:

  - You are about to drop the column `familyPhotos` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('MAIN_CHILD', 'SIBLING', 'PARENT', 'GRANDPARENT');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "familyPhotos",
ADD COLUMN     "familyMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "groupPhotoUrl" TEXT;

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "croppedPhotoUrl" TEXT NOT NULL,
    "characterDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FamilyMember_orderId_idx" ON "FamilyMember"("orderId");

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
