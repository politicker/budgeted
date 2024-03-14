package domain

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/gocarina/gocsv"
	"github.com/pkg/errors"
	"github.com/politicker/budgeted/internal/cmdutil"
	"github.com/politicker/budgeted/internal/db"
)

func Import(ctx context.Context, db *db.Queries, importFunc func(context.Context, int64) error) error {
	err := db.ImportLogCreate(ctx, time.Now())
	if err != nil {
		return err
	}

	importLogId, err := db.ImportLogGetLastInsertID(ctx)
	if err != nil {
		return err
	}

	err = importFunc(ctx, importLogId)
	if err != nil {
		return err
	}

	err = db.ImportLogComplete(ctx, importLogId)
	if err != nil {
		return err
	}

	return nil
}

func LoadTransactions(ctx context.Context, queries *db.Queries, importLogId int64) error {
	cache := make(map[string]string)

	// Walk cache directory
	err := filepath.WalkDir(
		path.Join("public", "cache"),
		func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}

			if d.IsDir() {
				return nil
			}

			cache[d.Name()] = "cached"
			return nil
		})

	if err != nil {
		return errors.Wrap(err, "failed to read cache directory")
	}

	// Walk CSV directory
	err = filepath.WalkDir(filepath.Join(cmdutil.ConfigDir(), "csv"), func(fp string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}

		if strings.HasSuffix(fp, "accounts.csv") {
			return nil
		}

		fmt.Println("fp", fp)

		data, err := os.Open(fp)
		if err != nil {
			return errors.Wrapf(err, "failed to read file: %s", fp)
		}

		var transactions []Transaction
		if err := gocsv.Unmarshal(data, &transactions); err != nil {
			return errors.Wrapf(err, "failed to parse CSV file: %s", fp)
		}

		for _, transaction := range transactions {
			var (
				categoryIconURL = transaction.CategoryIconURL
				logoURL         = transaction.LogoURL
			)

			if categoryIconURL != "" {
				categoryIconURL, err = cacheFile(cache, categoryIconURL)
				if err != nil {
					return err
				}
			}

			if logoURL != "" {
				logoURL, err = cacheFile(cache, logoURL)
				if err != nil {
					return err
				}
			}

			err = queries.TransactionCreate(ctx, db.TransactionCreateParams{
				PlaidId:         transaction.PlaidID,
				PlaidAccountId:  transaction.PlaidAccountID,
				Date:            transaction.Date,
				Name:            transaction.Name,
				Amount:          transaction.Amount,
				Category:        transaction.Category,
				CheckNumber:     transaction.CheckNumber,
				CategoryIconUrl: categoryIconURL,
				LogoUrl:         logoURL,
				PaymentChannel:  transaction.PaymentChannel,
				MerchantName:    transaction.MerchantName,
				Address:         transaction.Address,
				City:            transaction.City,
				State:           transaction.State,
				Lat:             transaction.Lat.NullFloat64,
				Lon:             transaction.Lon.NullFloat64,
				PostalCode:      transaction.PostalCode,
				ImportLogId:     sql.NullInt64{Int64: importLogId, Valid: true},
			})
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return errors.Wrap(err, "failed to read CSV directory")
	}

	return nil
}

func LoadAccounts(ctx context.Context, queries *db.Queries, importLogId int64) error {
	csvFile := path.Join(cmdutil.ConfigDir(), "csv", "accounts.csv")
	data, err := os.Open(csvFile)
	if err != nil {
		return errors.Wrapf(err, "failed to read file: %s", csvFile)
	}

	var accounts []Account
	if err := gocsv.Unmarshal(data, &accounts); err != nil {
		return errors.Wrapf(err, "failed to parse CSV file: %s", csvFile)
	}

	for _, account := range accounts {
		err = queries.AccountCreate(ctx, db.AccountCreateParams{
			PlaidId:          account.PlaidID,
			PlaidItemId:      sql.NullString{String: account.PlaidItemID, Valid: true},
			Name:             account.Name,
			OfficialName:     sql.NullString{String: account.OfficialName, Valid: true},
			Subtype:          string(account.Subtype),
			Type:             string(account.Type),
			Mask:             account.Mask,
			AvailableBalance: sql.NullFloat64{Float64: account.CurrentBalance, Valid: true},
			CurrentBalance:   sql.NullFloat64{Float64: account.CurrentBalance, Valid: true},
			IsoCurrencyCode:  sql.NullString{String: account.ISOCurrencyCode, Valid: true},
			ImportLogId:      sql.NullInt64{Int64: importLogId, Valid: true},
		})
		if err != nil {
			return err
		}

		log.Println("created account", account.Name)
	}

	return nil
}

func LoadAccountBalances(ctx context.Context, queries *db.Queries, importLogId int64) error {
	csvFile := path.Join(cmdutil.ConfigDir(), "csv", "account_balances.csv")
	data, err := os.Open(csvFile)
	if err != nil {
		return errors.Wrapf(err, "failed to read file: %s", csvFile)
	}

	var accountBalances []AccountBalance
	if err := gocsv.Unmarshal(data, &accountBalances); err != nil {
		return errors.Wrapf(err, "failed to parse CSV file: %s", csvFile)
	}

	for _, accountBalance := range accountBalances {
		err = queries.AccountBalanceCreate(ctx, db.AccountBalanceCreateParams{
			AccountPlaidId: accountBalance.PlaidAccountID,
			Current:        accountBalance.Current,
			Available:      accountBalance.Available,
			Date:           accountBalance.Date,
			ImportLogId:    sql.NullInt64{Int64: importLogId, Valid: true},
		})
		if err != nil {
			return err
		}

		log.Println("created account balance", accountBalance.Current)
	}

	return nil
}
