-- CreateTable
CREATE TABLE "Account" (
    "plaidId" TEXT NOT NULL PRIMARY KEY,
    "plaidItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    "currentBalance" REAL,
    "availableBalance" REAL,
    "isoCurrencyCode" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "plaidId" TEXT NOT NULL PRIMARY KEY,
    "plaidAccountId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "categoryIconUrl" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "paymentChannel" TEXT NOT NULL,
    "merchantName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" REAL,
    "lon" REAL,
    "postalCode" TEXT NOT NULL,
    "accountPlaidId" TEXT,
    CONSTRAINT "Transaction_accountPlaidId_fkey" FOREIGN KEY ("accountPlaidId") REFERENCES "Account" ("plaidId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("address", "amount", "category", "categoryIconUrl", "checkNumber", "city", "date", "lat", "logoUrl", "lon", "merchantName", "name", "paymentChannel", "plaidAccountId", "plaidId", "postalCode", "state") SELECT "address", "amount", "category", "categoryIconUrl", "checkNumber", "city", "date", "lat", "logoUrl", "lon", "merchantName", "name", "paymentChannel", "plaidAccountId", "plaidId", "postalCode", "state" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
