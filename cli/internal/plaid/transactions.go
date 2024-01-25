package plaid

import (
	"context"
	"errors"
	"io"
	"log"

	"github.com/plaid/plaid-go/v20/plaid"
)

func (pc *APIClient) LoadTransactions(ctx context.Context) error {
	var hasMore bool = true

	// Get previous cursor from the latest cached response
	cursor, err := pc.GetNextCursor(ctx, "transactions")
	if err != nil {
		return err
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

		resp, raw, err := pc.PlaidApi.
			TransactionsSync(pc.ctx).
			TransactionsSyncRequest(*request).
			Execute()

		if err != nil {
			if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
				if plaidErr.ErrorMessage == "cursor not associated with access_token" {
					log.Println("Access token changed. Restarting sync.")
					cursor = ""
					continue
				}

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

		if err := pc.SetCache(ctx, "transactions", cursor, body); err != nil {
			return err
		}
	}

	return nil
}
