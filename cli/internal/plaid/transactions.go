package plaid

import (
	"context"
	"fmt"
	"io"
	"log"
	"path/filepath"

	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/politicker/budgeted/internal/db"
)

func (pc *APIClient) ExtractTransactions(ctx context.Context, institutionId string, accessToken string, queries *db.Queries) error {
	var hasMore bool = true
	prefix := filepath.Join("transactions", institutionId)

	// Get previous cursor from the latest cached response
	cursor, err := pc.GetNextCursor(ctx, prefix)
	if err != nil {
		return fmt.Errorf("failed to get next cursor: %w", err)
	}

	// Iterate through each page of new transaction updates for item
	for hasMore {
		IncludePersonalFinanceCategory := true
		options := plaid.TransactionsSyncRequestOptions{
			IncludePersonalFinanceCategory: &IncludePersonalFinanceCategory,
		}
		request := plaid.NewTransactionsSyncRequest(accessToken)
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
				if plaidErr.ErrorCode == "ITEM_LOGIN_REQUIRED" {
					log.Println("Item login required. Skipping sync.")

					if err := queries.InstitutionStatus(ctx, db.InstitutionStatusParams{
						Status:  "ITEM_LOGIN_REQUIRED",
						PlaidId: institutionId,
					}); err != nil {
						return fmt.Errorf("failed to update institution status: %w", err)
					}

					return nil
				}

				return fmt.Errorf("failed TransactionsSync plaid API call: %s", plaidErr.GetErrorMessage())
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

		if err := pc.SetCache(ctx, prefix, cursor, body); err != nil {
			return err
		}
	}

	return nil
}
