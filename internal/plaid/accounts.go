package plaid

import (
	"context"
	"encoding/json"
	"errors"
	"io"

	"github.com/plaid/plaid-go/v20/plaid"
)

func (pc *APIClient) LoadAccounts(ctx context.Context) error {
	accountsGetRequest := plaid.NewAccountsGetRequest(pc.accessToken)
	accountsGetRequest.SetOptions(plaid.AccountsGetRequestOptions{})

	data, err := pc.GetCache(ctx, "accounts")
	if err != nil {
		return err
	}

	accountsResponse := &plaid.AccountsGetResponse{}
	if err = json.Unmarshal(data, accountsResponse); err != nil {
		return err
	}

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

	if err = pc.SetCache(ctx, "accounts", "", body); err != nil {
		return err
	}

	return nil
}
