-- CreateTable
CREATE TABLE "Transaction" (
    "plaidId" TEXT NOT NULL,
    "plaidAccountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dateTime" DATETIME NOT NULL,
    "authorizedDatetime" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "merchantName" TEXT NOT NULL,
    "paymentChannel" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_plaidId_key" ON "Transaction"("plaidId");
