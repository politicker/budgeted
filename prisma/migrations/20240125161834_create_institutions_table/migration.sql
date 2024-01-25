/*
  Warnings:

  - You are about to drop the column `plaidAccessToken` on the `Account` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Institution" (
    "plaidId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "plaidAccessToken" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "plaidId" TEXT NOT NULL PRIMARY KEY,
    "plaidItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    "currentBalance" REAL,
    "availableBalance" REAL,
    "isoCurrencyCode" TEXT NOT NULL,
    "userId" INTEGER
);
INSERT INTO "new_Account" ("availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type", "userId") SELECT "availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type", "userId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
