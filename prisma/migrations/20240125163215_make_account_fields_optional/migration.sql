/*
  Warnings:

  - You are about to drop the column `userId` on the `Account` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "plaidId" TEXT NOT NULL PRIMARY KEY,
    "plaidItemId" TEXT,
    "name" TEXT NOT NULL,
    "officialName" TEXT,
    "subtype" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    "currentBalance" REAL,
    "availableBalance" REAL,
    "isoCurrencyCode" TEXT
);
INSERT INTO "new_Account" ("availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type") SELECT "availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
