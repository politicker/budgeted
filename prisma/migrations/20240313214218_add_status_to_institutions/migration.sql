-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Institution" (
    "plaidId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "plaidAccessToken" TEXT NOT NULL,
    "logo" TEXT,
    "color" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OK'
);
INSERT INTO "new_Institution" ("color", "logo", "name", "plaidAccessToken", "plaidId") SELECT "color", "logo", "name", "plaidAccessToken", "plaidId" FROM "Institution";
DROP TABLE "Institution";
ALTER TABLE "new_Institution" RENAME TO "Institution";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
