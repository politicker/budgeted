/*
  Warnings:

  - Added the required column `isoCurrencyCode` to the `AccountBalance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "current" REAL NOT NULL,
    "available" REAL NOT NULL,
    "isoCurrencyCode" TEXT NOT NULL,
    "accountPlaidId" TEXT NOT NULL,
    CONSTRAINT "AccountBalance_accountPlaidId_fkey" FOREIGN KEY ("accountPlaidId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AccountBalance" ("accountPlaidId", "available", "current", "id") SELECT "accountPlaidId", "available", "current", "id" FROM "AccountBalance";
DROP TABLE "AccountBalance";
ALTER TABLE "new_AccountBalance" RENAME TO "AccountBalance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
