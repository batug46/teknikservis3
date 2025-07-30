-- CreateTable
CREATE TABLE "LikedProduct" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LikedProduct_userId_idx" ON "LikedProduct"("userId");

-- CreateIndex
CREATE INDEX "LikedProduct_productId_idx" ON "LikedProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "LikedProduct_userId_productId_key" ON "LikedProduct"("userId", "productId");

-- AddForeignKey
ALTER TABLE "LikedProduct" ADD CONSTRAINT "LikedProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedProduct" ADD CONSTRAINT "LikedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
