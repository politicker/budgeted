-- CreateTable
CREATE TABLE "Budget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "range" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BudgetRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budgetId" INTEGER NOT NULL,
    "column" TEXT NOT NULL,
    "operator" TEXT NOT NULL DEFAULT 'CONTAINS',
    "value" TEXT NOT NULL,
    CONSTRAINT "BudgetRule_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
