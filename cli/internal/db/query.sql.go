// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0
// source: query.sql

package db

import (
	"context"
	"database/sql"
	"time"
)

const accountBalanceCreate = `-- name: AccountBalanceCreate :exec
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
                          "date"=excluded."date"
`

type AccountBalanceCreateParams struct {
	Current         float64
	Available       float64
	IsoCurrencyCode string
	AccountPlaidId  string
	Date            string
	ImportLogId     sql.NullInt64
}

func (q *Queries) AccountBalanceCreate(ctx context.Context, arg AccountBalanceCreateParams) error {
	_, err := q.db.ExecContext(ctx, accountBalanceCreate,
		arg.Current,
		arg.Available,
		arg.IsoCurrencyCode,
		arg.AccountPlaidId,
		arg.Date,
		arg.ImportLogId,
	)
	return err
}

const accountCreate = `-- name: AccountCreate :exec
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
                                   "isoCurrencyCode"=excluded."isoCurrencyCode"
`

type AccountCreateParams struct {
	PlaidId          string
	PlaidItemId      sql.NullString
	Name             string
	OfficialName     sql.NullString
	Subtype          string
	Type             string
	Mask             string
	AvailableBalance sql.NullFloat64
	CurrentBalance   sql.NullFloat64
	IsoCurrencyCode  sql.NullString
	ImportLogId      sql.NullInt64
}

func (q *Queries) AccountCreate(ctx context.Context, arg AccountCreateParams) error {
	_, err := q.db.ExecContext(ctx, accountCreate,
		arg.PlaidId,
		arg.PlaidItemId,
		arg.Name,
		arg.OfficialName,
		arg.Subtype,
		arg.Type,
		arg.Mask,
		arg.AvailableBalance,
		arg.CurrentBalance,
		arg.IsoCurrencyCode,
		arg.ImportLogId,
	)
	return err
}

const configGet = `-- name: ConfigGet :one
SELECT "plaidClientId",
       "plaidSecret"
from "Config"
LIMIT 1
`

func (q *Queries) ConfigGet(ctx context.Context) (Config, error) {
	row := q.db.QueryRowContext(ctx, configGet)
	var i Config
	err := row.Scan(&i.PlaidClientId, &i.PlaidSecret)
	return i, err
}

const importLogComplete = `-- name: ImportLogComplete :exec
UPDATE "ImportLog"
SET "syncCompletedAt"=CURRENT_TIMESTAMP
WHERE "id" = ?
`

func (q *Queries) ImportLogComplete(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, importLogComplete, id)
	return err
}

const importLogCreate = `-- name: ImportLogCreate :exec
INSERT INTO "ImportLog" ("syncStartedAt")
VALUES (?)
`

func (q *Queries) ImportLogCreate(ctx context.Context, syncstartedat time.Time) error {
	_, err := q.db.ExecContext(ctx, importLogCreate, syncstartedat)
	return err
}

const importLogGetLastInsertID = `-- name: ImportLogGetLastInsertID :one
SELECT last_insert_rowid()
`

func (q *Queries) ImportLogGetLastInsertID(ctx context.Context) (int64, error) {
	row := q.db.QueryRowContext(ctx, importLogGetLastInsertID)
	var last_insert_rowid int64
	err := row.Scan(&last_insert_rowid)
	return last_insert_rowid, err
}

const institutionList = `-- name: InstitutionList :many
SELECT "plaidId",
       "name",
       "plaidAccessToken"
from "Institution"
`

type InstitutionListRow struct {
	PlaidId          string
	Name             string
	PlaidAccessToken string
}

func (q *Queries) InstitutionList(ctx context.Context) ([]InstitutionListRow, error) {
	rows, err := q.db.QueryContext(ctx, institutionList)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []InstitutionListRow
	for rows.Next() {
		var i InstitutionListRow
		if err := rows.Scan(&i.PlaidId, &i.Name, &i.PlaidAccessToken); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const institutionStatus = `-- name: InstitutionStatus :exec
UPDATE "Institution"
SET "status" = ?
WHERE "plaidId" = ?
`

type InstitutionStatusParams struct {
	Status  string
	PlaidId string
}

func (q *Queries) InstitutionStatus(ctx context.Context, arg InstitutionStatusParams) error {
	_, err := q.db.ExecContext(ctx, institutionStatus, arg.Status, arg.PlaidId)
	return err
}

const transactionCreate = `-- name: TransactionCreate :exec
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
                                   "postalCode"=excluded."postalCode"
`

type TransactionCreateParams struct {
	PlaidId         string
	PlaidAccountId  string
	Date            string
	Name            string
	Amount          float64
	Category        string
	CheckNumber     string
	CategoryIconUrl string
	LogoUrl         string
	PaymentChannel  string
	MerchantName    string
	Address         string
	City            string
	State           string
	Lat             sql.NullFloat64
	Lon             sql.NullFloat64
	PostalCode      string
	ImportLogId     sql.NullInt64
}

func (q *Queries) TransactionCreate(ctx context.Context, arg TransactionCreateParams) error {
	_, err := q.db.ExecContext(ctx, transactionCreate,
		arg.PlaidId,
		arg.PlaidAccountId,
		arg.Date,
		arg.Name,
		arg.Amount,
		arg.Category,
		arg.CheckNumber,
		arg.CategoryIconUrl,
		arg.LogoUrl,
		arg.PaymentChannel,
		arg.MerchantName,
		arg.Address,
		arg.City,
		arg.State,
		arg.Lat,
		arg.Lon,
		arg.PostalCode,
		arg.ImportLogId,
	)
	return err
}

const transactionDeleteAll = `-- name: TransactionDeleteAll :exec
DELETE FROM "Transaction"
`

func (q *Queries) TransactionDeleteAll(ctx context.Context) error {
	_, err := q.db.ExecContext(ctx, transactionDeleteAll)
	return err
}
