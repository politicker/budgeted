package plaid

import (
	"context"
	"errors"
	"io"
	"path/filepath"

	"github.com/plaid/plaid-go/v20/plaid"
)

func (pc *APIClient) LoadAccounts(ctx context.Context, institutionId string, accessToken string) error {
	accountsGetRequest := plaid.NewAccountsGetRequest(accessToken)
	accountsGetRequest.SetOptions(plaid.AccountsGetRequestOptions{})

	resp, raw, err := pc.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*accountsGetRequest,
	).Execute()
	if err != nil {
		if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
			return errors.New(plaidErr.GetErrorMessage())
		} else {
			return err
		}
	}

	if len(resp.Accounts) == 0 {
		return errors.New("no accounts to sync")
	}

	body, err := io.ReadAll(raw.Body)
	if err != nil {
		return err
	}

	if err = pc.SetCache(ctx, filepath.Join("transactions", institutionId), "", body); err != nil {
		return err
	}

	return nil
}
