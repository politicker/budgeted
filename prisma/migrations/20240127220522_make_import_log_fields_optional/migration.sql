-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ImportLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "syncStartedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncCompletedAt" DATETIME,
    "transactionsCount" INTEGER
);
INSERT INTO "new_ImportLog" ("id", "syncCompletedAt", "syncStartedAt", "transactionsCount") SELECT "id", "syncCompletedAt", "syncStartedAt", "transactionsCount" FROM "ImportLog";
DROP TABLE "ImportLog";
ALTER TABLE "new_ImportLog" RENAME TO "ImportLog";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
