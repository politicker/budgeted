-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountBalance" (
    "current" REAL NOT NULL,
    "available" REAL NOT NULL,
    "isoCurrencyCode" TEXT NOT NULL,
    "accountPlaidId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importLogId" INTEGER,

    PRIMARY KEY ("accountPlaidId", "date"),
    CONSTRAINT "AccountBalance_accountPlaidId_fkey" FOREIGN KEY ("accountPlaidId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccountBalance_importLogId_fkey" FOREIGN KEY ("importLogId") REFERENCES "ImportLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AccountBalance" ("accountPlaidId", "available", "current", "date", "importLogId", "isoCurrencyCode") SELECT "accountPlaidId", "available", "current", "date", "importLogId", "isoCurrencyCode" FROM "AccountBalance";
DROP TABLE "AccountBalance";
ALTER TABLE "new_AccountBalance" RENAME TO "AccountBalance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
