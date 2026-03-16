-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'STORY_GENERATING', 'STORY_COMPLETE', 'IMAGES_GENERATING', 'IMAGES_COMPLETE', 'PDF_GENERATING', 'PREVIEW_READY', 'PAYMENT_PENDING', 'PAID', 'PRINTING', 'SHIPPED', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "ChildGender" AS ENUM ('boy', 'girl', 'other');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "childAge" INTEGER NOT NULL,
    "childGender" "ChildGender" NOT NULL,
    "theme" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "email" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "storyJson" JSONB,
    "referenceSheetUrl" TEXT,
    "interiorPdfUrl" TEXT,
    "coverPdfUrl" TEXT,
    "paymentId" TEXT,
    "paymentProvider" TEXT,
    "amountPaid" INTEGER,
    "currency" TEXT,
    "shippingName" TEXT,
    "shippingLine1" TEXT,
    "shippingLine2" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingPostal" TEXT,
    "shippingCountry" TEXT,
    "shippingPhone" TEXT,
    "luluJobId" TEXT,
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imagePrompt" TEXT NOT NULL,
    "sceneDescription" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentId_key" ON "Order"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_luluJobId_key" ON "Order"("luluJobId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Page_orderId_idx" ON "Page"("orderId");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Page_orderId_pageNumber_key" ON "Page"("orderId", "pageNumber");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

