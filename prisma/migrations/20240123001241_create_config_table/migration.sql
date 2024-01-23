-- AlterTable
ALTER TABLE "Account" ADD COLUMN "userId" INTEGER;

-- CreateTable
CREATE TABLE "Config" (
    "plaidAccessToken" TEXT NOT NULL,
    "plaidClientId" TEXT NOT NULL,
    "plaidSecret" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_plaidClientId_key" ON "Config"("plaidClientId");
