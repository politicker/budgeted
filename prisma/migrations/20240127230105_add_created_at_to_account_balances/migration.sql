-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "current" REAL NOT NULL,
    "available" REAL NOT NULL,
    "isoCurrencyCode" TEXT NOT NULL,
    "accountPlaidId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountBalance_accountPlaidId_fkey" FOREIGN KEY ("accountPlaidId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AccountBalance" ("accountPlaidId", "available", "current", "id", "isoCurrencyCode") SELECT "accountPlaidId", "available", "current", "id", "isoCurrencyCode" FROM "AccountBalance";
DROP TABLE "AccountBalance";
ALTER TABLE "new_AccountBalance" RENAME TO "AccountBalance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
