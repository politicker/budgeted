package plaid

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path"
	"strings"
	"time"

	"github.com/plaid/plaid-go/v20/plaid"
)

func (pc *APIClient) LoadTransactions(ctx context.Context) error {
func LoadTransactions(ctx context.Context, accessToken string, jsonStorage string, sandboxSecret string) error {
	var client *plaid.APIClient

	if sandboxSecret == "" {
		client = NewClient()
	} else {
		client = NewClient(UseSandbox)
		sandboxPublicTokenResp, _, err := client.PlaidApi.SandboxPublicTokenCreate(ctx).SandboxPublicTokenCreateRequest(
			*plaid.NewSandboxPublicTokenCreateRequest(
				"ins_109508",
				[]plaid.Products{plaid.PRODUCTS_TRANSACTIONS},
			),
		).Execute()

		if err != nil {
			if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
				return errors.New(plaidErr.GetErrorMessage())
			} else {
				return err
			}
		}

		exchangePublicTokenResp, _, err := client.PlaidApi.ItemPublicTokenExchange(ctx).ItemPublicTokenExchangeRequest(
			*plaid.NewItemPublicTokenExchangeRequest(sandboxPublicTokenResp.GetPublicToken()),
		).Execute()
		if err != nil {
			return err
		}

		accessToken = exchangePublicTokenResp.GetAccessToken()
		jsonStorage = path.Join(jsonStorage, "__SANDBOX__")

		if err := os.MkdirAll(jsonStorage, 0755); err != nil {
			return err
		}
	}

	var lastEntry os.DirEntry
	var syncResponse *plaid.TransactionsSyncResponse
	var cursor string
	hasMore := true

	entries, err := os.ReadDir(pc.cacheDir)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if lastEntry == nil || lastEntry.Name() < entry.Name() {
			lastEntry = entry
		}
	}

	// read the file
	if lastEntry != nil {
		bytes, err := os.ReadFile(fmt.Sprintf("%s/%s", pc.cacheDir, lastEntry.Name()))
		if err != nil {
			return err
		}

		syncResponse = &plaid.TransactionsSyncResponse{}
		if err := json.Unmarshal(bytes, syncResponse); err != nil {
			return err
		}

		cursor = syncResponse.GetNextCursor()
	}

	// Iterate through each page of new transaction updates for item
	for hasMore {
		IncludePersonalFinanceCategory := true
		options := plaid.TransactionsSyncRequestOptions{
			IncludePersonalFinanceCategory: &IncludePersonalFinanceCategory,
		}
		request := plaid.NewTransactionsSyncRequest(pc.accessToken)
		request.SetOptions(options)

		if cursor != "" {
			request.SetCursor(cursor)
		}

		resp, raw, err := pc.PlaidApi.TransactionsSync(
			ctx,
		).TransactionsSyncRequest(*request).Execute()

		if err != nil {
			if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
				return errors.New(plaidErr.GetErrorMessage())
			} else {
				return err
			}
		}

		if len(resp.Added)+len(resp.Modified)+len(resp.Removed) == 0 {
			log.Println("no transactions to sync")
			return nil
		}

		body, err := io.ReadAll(raw.Body)
		if err != nil {
			return err
		}

		hasMore = resp.GetHasMore()
		nextCursor := resp.GetNextCursor()
		cursor = nextCursor
		timestamp := strings.Replace(time.Now().Format(time.RFC3339Nano), ":", "X", -1)

		fileName := fmt.Sprintf("%s/%s_%s.json", pc.cacheDir, timestamp, cursor)
		log.Println("writing", fileName)
		if err := os.WriteFile(fileName, body, 0644); err != nil {
			return err
		}
	}

	return nil
}
