/*
  Warnings:

  - You are about to drop the column `plaidAccessToken` on the `Config` table. All the data in the column will be lost.
  - Added the required column `plaidAccessToken` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
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
    "userId" INTEGER,
    "plaidAccessToken" TEXT NOT NULL
);
INSERT INTO "new_Account" ("availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type", "userId", "plaidAccessToken") SELECT "availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type", "userId", "access-sandbox-357a2c41-d08a-4026-ae6b-29fec4fd3804" as plaidAccessToken FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE TABLE "new_Config" (
    "plaidClientId" TEXT NOT NULL PRIMARY KEY,
    "plaidSecret" TEXT NOT NULL
);
INSERT INTO "new_Config" ("plaidClientId", "plaidSecret") SELECT "plaidClientId", "plaidSecret" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
