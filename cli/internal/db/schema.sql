CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "Config" (
    "plaidClientId" TEXT NOT NULL PRIMARY KEY,
    "plaidSecret" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "Institution" (
    "plaidId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "plaidAccessToken" TEXT NOT NULL
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "Transaction" (
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
    "postalCode" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importLogId" INTEGER,
    CONSTRAINT "Transaction_plaidAccountId_fkey" FOREIGN KEY ("plaidAccountId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_importLogId_fkey" FOREIGN KEY ("importLogId") REFERENCES "ImportLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ImportLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "syncStartedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncCompletedAt" DATETIME,
    "transactionsCount" INTEGER
);
CREATE TABLE IF NOT EXISTS "Account" (
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
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importLogId" INTEGER,
    CONSTRAINT "Account_institutionPlaidId_fkey" FOREIGN KEY ("institutionPlaidId") REFERENCES "Institution" ("plaidId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Account_importLogId_fkey" FOREIGN KEY ("importLogId") REFERENCES "ImportLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "AccountBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "current" REAL NOT NULL,
    "available" REAL NOT NULL,
    "isoCurrencyCode" TEXT NOT NULL,
    "accountPlaidId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountBalance_accountPlaidId_fkey" FOREIGN KEY ("accountPlaidId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE
);
