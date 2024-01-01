package csv

import (
	"context"
	"encoding/json"
	"github.com/gocarina/gocsv"
	"github.com/plaid/plaid-go/v20/plaid"
	"log"
	"os"
	"path/filepath"
	"strings"
)

type Transaction struct {
	PlaidID         string   `csv:"plaidId"`
	PlaidAccountID  string   `csv:"plaidAccountId"`
	Date            string   `csv:"date"`
	Name            string   `csv:"name"`
	Amount          float64  `csv:"amount"`
	Category        string   `csv:"category"`
	CheckNumber     string   `csv:"checkNumber"`
	CategoryIconURL string   `csv:"categoryIconUrl"`
	LogoURL         string   `csv:"logoUrl"`
	PaymentChannel  string   `csv:"paymentChannel"`
	MerchantName    string   `csv:"merchantName"`
	Address         string   `csv:"address"`
	City            string   `csv:"city"`
	State           string   `csv:"state"`
	Lat             *float64 `csv:"lat"`
	Lon             *float64 `csv:"lon"`
	PostalCode      string   `csv:"postalCode"`
}

func LoadTransactions(ctx context.Context, jsonStorage string, csvStorage string) error {
	var added []plaid.Transaction
	var deleted []plaid.RemovedTransaction
	var modified []plaid.Transaction
	transactionsByID := make(map[string]plaid.Transaction)
	transactionsByDate := make(map[string][]plaid.Transaction)

	err := filepath.WalkDir(jsonStorage, func(path string, d os.DirEntry, err error) error {
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
			lat, _ := location.GetLatOk()
			lon, _ := location.GetLonOk()

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
