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
    "isoCurrencyCode" TEXT,
    "institutionPlaidId" TEXT,
    CONSTRAINT "Account_institutionPlaidId_fkey" FOREIGN KEY ("institutionPlaidId") REFERENCES "Institution" ("plaidId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type") SELECT "availableBalance", "currentBalance", "isoCurrencyCode", "mask", "name", "officialName", "plaidId", "plaidItemId", "subtype", "type" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
