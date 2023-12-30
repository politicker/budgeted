package plaid

import (
	"context"
	"errors"
	"fmt"
	"github.com/plaid/plaid-go/v20/plaid"
	"io"
	"os"
	"strings"
	"time"
)

func LoadTransactions(ctx context.Context, accessToken string, jsonStorage string) error {
	client := NewClient()
	// Provide a cursor from your database if you've previously
	// received one for the Item. Leave null if this is your
	// first sync call for this Item. The first request will
	// return a cursor.
	var cursor *string = nil

	// New transaction updates since "cursor"
	hasMore := true
	IncludePersonalFinanceCategory := true
	options := plaid.TransactionsSyncRequestOptions{
		IncludePersonalFinanceCategory: &IncludePersonalFinanceCategory,
	}

	// Iterate through each page of new transaction updates for item
	for hasMore {
		request := plaid.NewTransactionsSyncRequest(accessToken)
		request.SetOptions(options)
		if cursor != nil {
			request.SetCursor(*cursor)
		}
		resp, raw, err := client.PlaidApi.TransactionsSync(
			ctx,
		).TransactionsSyncRequest(*request).Execute()

		if err != nil {
			if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
				return errors.New(plaidErr.GetErrorMessage())
			} else {
				return err
			}
		}

		body, err := io.ReadAll(raw.Body)
		if err != nil {
			return err
		}

		hasMore = resp.GetHasMore()
		nextCursor := resp.GetNextCursor()
		cursor = &nextCursor
		timestamp := strings.Replace(time.Now().Format(time.RFC3339Nano), ":", "X", -1)

		if err := os.WriteFile(fmt.Sprintf("%s/%s_%s.json", jsonStorage, timestamp, *cursor), body, 0644); err != nil {
			return err
		}
	}

	return nil
}
