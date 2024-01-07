package plaid

import (
	"context"

	"github.com/plaid/plaid-go/v20/plaid"
)

func (pc *APIClient) LoadAccounts(ctx context.Context, accountIds []string) ([]plaid.AccountBase, error) {
	accountsGetRequest := plaid.NewAccountsGetRequest(pc.accessToken)
	accountsGetRequest.SetOptions(plaid.AccountsGetRequestOptions{})

	accountsGetResp, _, err := pc.PlaidApi.AccountsGet(ctx).AccountsGetRequest(
		*accountsGetRequest,
	).Execute()
	if err != nil {
		return nil, err
	}

	return accountsGetResp.GetAccounts(), nil
}
