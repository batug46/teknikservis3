-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReturnStatus" ADD VALUE 'SHIPPING_REQUIRED';
ALTER TYPE "ReturnStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "ReturnStatus" ADD VALUE 'RECEIVED';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "originalPrice" DECIMAL(10,2),
ADD COLUMN     "soldCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductReview" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "Return" ADD COLUMN     "courierCompany" TEXT,
ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(10,2),
ADD COLUMN     "shippingInstructions" TEXT,
ADD COLUMN     "trackingNumber" TEXT;
