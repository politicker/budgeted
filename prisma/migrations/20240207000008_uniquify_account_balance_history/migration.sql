/*
  Warnings:

  - The primary key for the `AccountBalance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `AccountBalance` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `AccountBalance` table. All the data in the column will be lost.
  - Added the required column `date` to the `AccountBalance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountBalance" (
    "current" REAL NOT NULL,
    "available" REAL NOT NULL,
    "isoCurrencyCode" TEXT NOT NULL,
    "accountPlaidId" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    PRIMARY KEY ("accountPlaidId", "date"),
    CONSTRAINT "AccountBalance_accountPlaidId_fkey" FOREIGN KEY ("accountPlaidId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AccountBalance" ("accountPlaidId", "available", "current", "isoCurrencyCode") SELECT "accountPlaidId", "available", "current", "isoCurrencyCode" FROM "AccountBalance";
DROP TABLE "AccountBalance";
ALTER TABLE "new_AccountBalance" RENAME TO "AccountBalance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
