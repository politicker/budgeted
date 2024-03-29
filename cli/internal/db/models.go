// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0

package db

import (
	"database/sql"
	"time"
)

type Account struct {
	PlaidId            string
	PlaidItemId        sql.NullString
	Name               string
	OfficialName       sql.NullString
	Subtype            string
	Type               string
	Mask               string
	CurrentBalance     sql.NullFloat64
	AvailableBalance   sql.NullFloat64
	IsoCurrencyCode    sql.NullString
	InstitutionPlaidId sql.NullString
	ImportedAt         time.Time
	ImportLogId        sql.NullInt64
}

type AccountBalance struct {
	Current         float64
	Available       float64
	IsoCurrencyCode string
	AccountPlaidId  string
	Date            string
	ImportedAt      time.Time
	ImportLogId     sql.NullInt64
}

type Budget struct {
	ID     int64
	Name   string
	Amount float64
	Range  int64
}

type BudgetFilter struct {
	ID       int64
	BudgetId int64
	Column   string
	Operator string
	Value    string
}

type Config struct {
	PlaidClientId string
	PlaidSecret   string
}

type ImportLog struct {
	ID                int64
	SyncStartedAt     time.Time
	SyncCompletedAt   sql.NullTime
	TransactionsCount sql.NullInt64
}

type Institution struct {
	PlaidId          string
	Name             string
	PlaidAccessToken string
	Logo             sql.NullString
	Color            sql.NullString
	Status           string
}

type PrismaMigrations struct {
	ID                string
	Checksum          string
	FinishedAt        sql.NullTime
	MigrationName     string
	Logs              sql.NullString
	RolledBackAt      sql.NullTime
	StartedAt         time.Time
	AppliedStepsCount interface{}
}

type SqliteSequence struct {
	Name interface{}
	Seq  interface{}
}

type Transaction struct {
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
	Hidden          bool
	ImportedAt      time.Time
	ImportLogId     sql.NullInt64
}
