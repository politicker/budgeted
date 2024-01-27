-- CreateTable
CREATE TABLE "ImportLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "syncStartedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncCompletedAt" DATETIME NOT NULL,
    "transactionsCount" INTEGER NOT NULL
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
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importLogId" INTEGER,
    CONSTRAINT "Transaction_plaidAccountId_fkey" FOREIGN KEY ("plaidAccountId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_importLogId_fkey" FOREIGN KEY ("importLogId") REFERENCES "ImportLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("address", "amount", "category", "categoryIconUrl", "checkNumber", "city", "date", "hidden", "lat", "logoUrl", "lon", "merchantName", "name", "paymentChannel", "plaidAccountId", "plaidId", "postalCode", "state") SELECT "address", "amount", "category", "categoryIconUrl", "checkNumber", "city", "date", "hidden", "lat", "logoUrl", "lon", "merchantName", "name", "paymentChannel", "plaidAccountId", "plaidId", "postalCode", "state" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
