/*
  Warnings:

  - You are about to drop the column `accountName` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `authorizedDatetime` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `dateTime` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `categoryIconUrl` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkNumber` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logoUrl` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
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
    "postalCode" TEXT NOT NULL
);
INSERT INTO "new_Transaction" ("address", "amount", "category", "city", "date", "merchantName", "name", "paymentChannel", "plaidAccountId", "plaidId", "postalCode") SELECT "address", "amount", "category", "city", "date", "merchantName", "name", "paymentChannel", "plaidAccountId", "plaidId", "postalCode" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
