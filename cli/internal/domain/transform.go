package domain

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gocarina/gocsv"
	"github.com/plaid/plaid-go/v20/plaid"
)

func TransformTransactions(ctx context.Context, jsonStorage string, csvStorage string) error {
	var added []plaid.Transaction
	var deleted []plaid.RemovedTransaction
	var modified []plaid.Transaction
	transactionsByID := make(map[string]plaid.Transaction)
	transactionsByDate := make(map[string][]plaid.Transaction)
	transactionsPath := fmt.Sprintf("%s/transactions", jsonStorage)

	err := filepath.WalkDir(transactionsPath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		log.Println("loading", d.Name())

		bytes, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		syncResponse := plaid.TransactionsSyncResponse{}
		if err := json.Unmarshal(bytes, &syncResponse); err != nil {
			return err
		}

		added = append(added, syncResponse.GetAdded()...)
		deleted = append(deleted, syncResponse.GetRemoved()...)
		modified = append(modified, syncResponse.GetModified()...)

		return nil
	})
	if err != nil {
		return err
	}

	for _, transaction := range added {
		log.Println("adding", transaction.GetTransactionId())
		transactionsByID[transaction.GetTransactionId()] = transaction
	}

	for _, transaction := range modified {
		log.Println("modifying", transaction.GetTransactionId())
		transactionsByID[transaction.GetTransactionId()] = transaction
	}

	for _, transaction := range deleted {
		log.Println("deleting", transaction.GetTransactionId())
		delete(transactionsByID, transaction.GetTransactionId())
	}

	for _, transaction := range transactionsByID {
		date := transaction.GetDate()
		transactionsByDate[date] = append(transactionsByDate[date], transaction)
	}

	for date, transactions := range transactionsByDate {
		filePath := filepath.Join(csvStorage, strings.Join(strings.Split(date, "-"), "/")+".csv")
		log.Println("writing", filePath)
		var transactionsCSV []Transaction

		for _, transaction := range transactions {
			location := transaction.GetLocation()

			locLat, _ := location.GetLatOk()
			lat := NullableFloat64FromPtr(locLat)

			locLon, _ := location.GetLonOk()
			lon := NullableFloat64FromPtr(locLon)

			transactionsCSV = append(transactionsCSV, Transaction{
				PlaidID:         transaction.GetTransactionId(),
				PlaidAccountID:  transaction.GetAccountId(),
				Date:            transaction.GetDate(),
				Name:            transaction.GetName(),
				Amount:          transaction.GetAmount(),
				Category:        strings.Join(transaction.GetCategory(), ","),
				CheckNumber:     transaction.GetCheckNumber(),
				CategoryIconURL: transaction.GetPersonalFinanceCategoryIconUrl(),
				LogoURL:         transaction.GetLogoUrl(),
				PaymentChannel:  transaction.GetPaymentChannel(),
				MerchantName:    transaction.GetMerchantName(),
				Address:         location.GetAddress(),
				City:            location.GetCity(),
				State:           location.GetRegion(),
				Lat:             lat,
				Lon:             lon,
				PostalCode:      location.GetPostalCode(),
			})
		}

		csvContent, err := gocsv.MarshalString(&transactionsCSV)
		if err != nil {
			return err
		}

		if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
			return err
		}

		if err := os.WriteFile(filePath, []byte(csvContent), 0644); err != nil {
			return err
		}
	}

	return nil
}

// TransformAccounts transforms the JSON account files into CSV files.
// For accounts, we find the latest JSON file in the instititution's accounts directory.
// Each ETL run will write a new JSON file with the most up-to-date accounts and account info,
// so we only need to use the latest file.
// The unfortunate side-effect of that is rebuilding a SQLite database will no longer rebuild
// historical account balances.
func TransformAccounts(ctx context.Context, jsonStorage string, csvStorage string) error {
	var accountsCSV []Account

	accountsPath := fmt.Sprintf("%s/accounts", jsonStorage)

	files, err := os.ReadDir(accountsPath)
	if err != nil {
		log.Fatal(err)
	}

	var newestTime time.Time
	var newestFile fs.DirEntry
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		info, err := file.Info()
		if err != nil {
			log.Fatal(err)
		}

		if newestFile == nil || info.ModTime().After(newestTime) {
			newestFile = file
			newestTime = info.ModTime()
		}
	}
	if newestFile == nil {
		return errors.New("no valid account files found")
	}

	jsonFilePath := accountsPath + "/" + newestFile.Name()
	bytes, err := os.ReadFile(jsonFilePath)
	if err != nil {
		log.Fatal(err)
	}

	response := plaid.AccountsGetResponse{}
	if err = json.Unmarshal(bytes, &response); err != nil {
		return err
	}

	for _, account := range response.GetAccounts() {
		balance := account.GetBalances()
		item := response.GetItem()

		accountsCSV = append(accountsCSV, Account{
			PlaidID:          account.GetAccountId(),
			AvailableBalance: balance.GetAvailable(),
			CurrentBalance:   balance.GetCurrent(),
			ISOCurrencyCode:  balance.GetIsoCurrencyCode(),
			Limit:            balance.GetLimit(),
			Mask:             account.GetMask(),
			Name:             account.GetName(),
			OfficialName:     account.GetOfficialName(),
			Subtype:          account.GetSubtype(),
			Type:             account.GetType(),
			PlaidItemID:      item.GetItemId(),
		})
	}

	csvContent, err := gocsv.MarshalString(&accountsCSV)
	if err != nil {
		return err
	}

	fp := filepath.Join(csvStorage, "accounts.csv")
	if err := os.WriteFile(fp, []byte(csvContent), 0644); err != nil {
		return err
	}

	return nil
}
