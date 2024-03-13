-- name: TransactionCreate :exec
INSERT INTO "Transaction"("plaidId",
                          "plaidAccountId",
                          "date",
                          "name",
                          "amount",
                          "category",
                          "checkNumber",
                          "categoryIconUrl",
                          "logoUrl",
                          "paymentChannel",
                          "merchantName",
                          "address",
                          "city",
                          "state",
                          "lat",
                          "lon",
                          "postalCode",
                          "importedAt",
                          "importLogId")
VALUES (?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        CURRENT_TIMESTAMP,
        ?)
ON CONFLICT(plaidId) DO UPDATE SET plaidId=excluded."plaidId",
                                   "plaidAccountId"=excluded."plaidAccountId",
                                   "date"=excluded."date",
                                   "name"=excluded."name",
                                   "amount"=excluded."amount",
                                   "category"=excluded."category",
                                   "checkNumber"=excluded."checkNumber",
                                   "categoryIconUrl"=excluded."categoryIconUrl",
                                   "logoUrl"=excluded."logoUrl",
                                   "paymentChannel"=excluded."paymentChannel",
                                   "merchantName"=excluded."merchantName",
                                   "address"=excluded."address",
                                   "city"=excluded."city",
                                   "state"=excluded."state",
                                   "lat"=excluded."lat",
                                   "lon"=excluded."lon",
                                   "postalCode"=excluded."postalCode";

-- name: TransactionDeleteAll :exec
DELETE FROM "Transaction";

-- name: AccountCreate :exec
INSERT INTO "Account"("plaidId",
                      "plaidItemId",
                      "name",
                      "officialName",
                      "subtype",
                      "type",
                      "mask",
                      "availableBalance",
                      "currentBalance",
                      "isoCurrencyCode",
                      "importLogId",
                      "importedAt")
VALUES (?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        CURRENT_TIMESTAMP)
ON CONFLICT(plaidId) DO UPDATE SET plaidId=excluded."plaidId",
                                   "plaidItemId"=excluded."plaidItemId",
                                   "officialName"=excluded."officialName",
                                   "subtype"=excluded."subtype",
                                   "type"=excluded."type",
                                   "mask"=excluded."mask",
                                   "availableBalance"=excluded."availableBalance",
                                   "currentBalance"=excluded."currentBalance",
                                   "isoCurrencyCode"=excluded."isoCurrencyCode";

-- name: ConfigGet :one
SELECT "plaidClientId",
       "plaidSecret"
from "Config"
LIMIT 1;

-- name: InstitutionList :many
SELECT "plaidId",
       "name",
       "plaidAccessToken"
from "Institution";

-- name: ImportLogCreate :exec
INSERT INTO "ImportLog" ("syncStartedAt")
VALUES (?);

-- name: ImportLogGetLastInsertID :one
SELECT last_insert_rowid();

-- name: ImportLogComplete :exec
UPDATE "ImportLog"
SET "syncCompletedAt"=CURRENT_TIMESTAMP
WHERE "id" = ?;

-- name: AccountBalanceCreate :exec
INSERT INTO "AccountBalance"("current",
                             "available",
                             "isoCurrencyCode",
                             "accountPlaidId",
                             "date",
                             "importLogId",
                             "importedAt")
VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
ON CONFLICT DO UPDATE SET "current"=excluded."current",
                          "available"=excluded."available",
                          "isoCurrencyCode"=excluded."isoCurrencyCode",
                          "accountPlaidId"=excluded."accountPlaidId",
                          "date"=excluded."date";