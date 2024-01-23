-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "plaidAccessToken" TEXT,
    "plaidClientId" TEXT NOT NULL PRIMARY KEY,
    "plaidSecret" TEXT NOT NULL
);
INSERT INTO "new_Config" ("plaidAccessToken", "plaidClientId", "plaidSecret") SELECT "plaidAccessToken", "plaidClientId", "plaidSecret" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
