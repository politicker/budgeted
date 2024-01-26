// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.24.0

package db

import (
	"database/sql"
	"time"
)

type Account struct {
	PlaidId          string
	PlaidItemId      sql.NullString
	Name             string
	OfficialName     sql.NullString
	Subtype          string
	Type             string
	Mask             string
	CurrentBalance   sql.NullFloat64
	AvailableBalance sql.NullFloat64
	IsoCurrencyCode  sql.NullString
}

type Config struct {
	PlaidClientId string
	PlaidSecret   string
}

type Institution struct {
	PlaidId          string
	Name             string
	PlaidAccessToken string
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
	AccountPlaidId  sql.NullString
	Hidden          bool
}
