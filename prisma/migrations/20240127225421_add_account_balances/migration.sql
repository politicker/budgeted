-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "current" REAL NOT NULL,
    "available" REAL NOT NULL,
    "accountPlaidId" TEXT NOT NULL,
    CONSTRAINT "AccountBalance_accountPlaidId_fkey" FOREIGN KEY ("accountPlaidId") REFERENCES "Account" ("plaidId") ON DELETE RESTRICT ON UPDATE CASCADE
);
