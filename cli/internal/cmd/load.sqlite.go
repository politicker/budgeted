package cmd

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/gocarina/gocsv"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"github.com/politicker/budgeted/internal/csv"
	"github.com/politicker/budgeted/internal/db"
	"github.com/spf13/cobra"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func cacheFile(cache map[string]string, url string) (string, error) {
	name := path.Base(url)

	if _, ok := cache[name]; !ok {
		data, err := fetch(url)
		if err != nil {
			return "", errors.Wrapf(err, "fetch failed for %s", url)
		}

		err = os.WriteFile(
			path.Join("public", "cache", name),
			data,
			0o644,
		)
		if err != nil {
			return "", errors.Wrapf(err, "failed to write cache file for %s", url)
		}

		cache[name] = "cached"
	}

	return "./cache/" + name, nil
}

func loadTransactionsFromCSV(ctx context.Context) error {
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
	err = filepath.WalkDir(path.Join(os.Getenv("HOME"), ".config", "budgeted", "csv"), func(fp string, d fs.DirEntry, err error) error {
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

		var transactions []csv.Transaction
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

			driver, err := sql.Open("sqlite3", filepath.Join(os.Getenv("HOME"), ".config", "budgeted", "db.sqlite"))
			if err != nil {
				return err
			}

			queries := db.New(driver)

			err = queries.CreateTransaction(ctx, db.CreateTransactionParams{
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

func loadAccountsFromCSV(ctx context.Context) error {
	csvFile := path.Join(os.Getenv("HOME"), ".config", "budgeted", "csv", "accounts.csv")
	data, err := os.Open(csvFile)
	if err != nil {
		return errors.Wrapf(err, "failed to read file: %s", csvFile)
	}

	var accounts []csv.Account
	if err := gocsv.Unmarshal(data, &accounts); err != nil {
		return errors.Wrapf(err, "failed to parse CSV file: %s", csvFile)
	}

	driver, err := sql.Open("sqlite3", filepath.Join(os.Getenv("HOME"), ".config", "budgeted", "db.sqlite"))
	if err != nil {
		return err
	}

	queries := db.New(driver)
	for _, account := range accounts {
		err = queries.CreateAccount(ctx, db.CreateAccountParams{
			PlaidId:          account.PlaidID,
			PlaidItemId:      account.PlaidItemID,
			Name:             account.Name,
			OfficialName:     account.OfficialName,
			Subtype:          string(account.Subtype),
			Type:             string(account.Type),
			Mask:             account.Mask,
			AvailableBalance: sql.NullFloat64{Float64: account.CurrentBalance, Valid: true},
			CurrentBalance:   sql.NullFloat64{Float64: account.CurrentBalance, Valid: true},
			IsoCurrencyCode:  account.ISOCurrencyCode,
		})
		if err != nil {
			return err
		}

		log.Println("created account", account.Name)
	}

	return nil
}

func fetch(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to fetch URL: %s", url)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to read response body for URL: %s", url)
	}

	return data, nil
}

func LoadSqliteCmd() *cobra.Command {
	command := cobra.Command{
		Use:   "sqlite",
		Short: "load data from sqlite",
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx := context.Background()
			err := loadTransactionsFromCSV(ctx)
			if err != nil {
				return err
			}

			err = loadAccountsFromCSV(ctx)
			if err != nil {
				return err
			}

			return nil
		},
	}

	return &command
}
