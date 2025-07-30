-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('REFUND', 'EXCHANGE', 'CREDIT');

-- CreateTable
CREATE TABLE "Return" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "returnType" "ReturnType" NOT NULL DEFAULT 'REFUND',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Return_userId_idx" ON "Return"("userId");

-- CreateIndex
CREATE INDEX "Return_orderItemId_idx" ON "Return"("orderItemId");

-- CreateIndex
CREATE INDEX "Return_status_idx" ON "Return"("status");

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
