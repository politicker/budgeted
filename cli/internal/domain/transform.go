package domain

import (
	"context"
	"encoding/json"
	"fmt"
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

func TransformAccounts(ctx context.Context, jsonStorage string, csvStorage string) error {
	var accountsCSV []Account
	var newestFile os.DirEntry
	var newestTime time.Time

	accountsPath := fmt.Sprintf("%s/accounts", jsonStorage)

	err := filepath.WalkDir(accountsPath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		// Find the newest file in this directory
		// If this isn't the newest file, skip import on this iteration
		info, err := d.Info()
		if err != nil {
			return err
		}
		if newestFile == nil || info.ModTime().After(newestTime) {
			newestFile = d
			newestTime = info.ModTime()
		} else {
			return nil
		}

		bytes, err := os.ReadFile(path)
		if err != nil {
			return err
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

		return nil
	})
	if err != nil {
		return err
	}

	csvContent, err := gocsv.MarshalString(&accountsCSV)
	if err != nil {
		return err
	}

	filePath := filepath.Join(csvStorage, "accounts.csv")
	if err := os.WriteFile(filePath, []byte(csvContent), 0644); err != nil {
		return err
	}

	return nil
}
