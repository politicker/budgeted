package csv

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/pkg/errors"
	"github.com/plaid/plaid-go/v20/plaid"
)

type MyNullFloat64 struct {
	sql.NullFloat64
}

func (f *MyNullFloat64) MarshalCSV() (string, error) {
	if f.Valid {
		return fmt.Sprintf("%f", f.Float64), nil
	} else {
		return "", nil
	}
}

func (f *MyNullFloat64) UnmarshalCSV(csv string) (err error) {
	if csv == "" {
		f.Valid = false
		return nil
	}

	if n, err := strconv.ParseFloat(csv, 64); err == nil {
		f.Float64 = n
		f.Valid = true
		return nil
	}

	return err
}

type Transaction struct {
	PlaidID         string        `csv:"plaidId"`
	PlaidAccountID  string        `csv:"plaidAccountId"`
	Date            string        `csv:"date"`
	Name            string        `csv:"name"`
	Amount          float64       `csv:"amount"`
	Category        string        `csv:"category"`
	CheckNumber     string        `csv:"checkNumber"`
	CategoryIconURL string        `csv:"categoryIconUrl"`
	LogoURL         string        `csv:"logoUrl"`
	PaymentChannel  string        `csv:"paymentChannel"`
	MerchantName    string        `csv:"merchantName"`
	Address         string        `csv:"address"`
	City            string        `csv:"city"`
	State           string        `csv:"state"`
	Lat             MyNullFloat64 `csv:"lat"`
	Lon             MyNullFloat64 `csv:"lon"`
	PostalCode      string        `csv:"postalCode"`
}

type Account struct {
	PlaidID          string               `csv:"plaidId"`
	AvailableBalance float64              `csv:"availableBalance"`
	CurrentBalance   float64              `csv:"currentBalance"`
	ISOCurrencyCode  string               `csv:"isoCurrencyCode"`
	Limit            float64              `csv:"limit"`
	Mask             string               `csv:"mask"`
	Name             string               `csv:"name"`
	OfficialName     string               `csv:"officialName"`
	Subtype          plaid.AccountSubtype `csv:"subtype"`
	Type             plaid.AccountType    `csv:"type"`
	PlaidItemID      string               `csv:"plaidItemId"`
}

func NullableFloat64FromPtr(n *float64) MyNullFloat64 {
	f := MyNullFloat64{}
	if n == nil {
		f.Valid = false
		return f
	}

	f.Float64 = *n
	f.Valid = true

	return f
}

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
