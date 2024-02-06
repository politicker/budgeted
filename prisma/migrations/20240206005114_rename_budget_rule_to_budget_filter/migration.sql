/*
  Warnings:

  - You are about to drop the `BudgetRule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BudgetRule";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "BudgetFilter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "column" TEXT NOT NULL,
    "operator" TEXT NOT NULL DEFAULT 'CONTAINS',
    "value" TEXT NOT NULL,
    CONSTRAINT "BudgetFilter_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
