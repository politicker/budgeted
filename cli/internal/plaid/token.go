package plaid

import (
	"github.com/pkg/errors"
	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/spf13/viper"
)

func (pc *APIClient) ExchangeToken(publicToken string) error {
	res, _, err := pc.PlaidApi.
		ItemPublicTokenExchange(pc.ctx).
		ItemPublicTokenExchangeRequest(*plaid.NewItemPublicTokenExchangeRequest(publicToken)).
		Execute()
	if err != nil {
		if plaidError, err := plaid.ToPlaidError(err); err == nil {
			return errors.New(plaidError.GetErrorMessage())
		}
		return errors.Wrap(err, "failed to exchange token")
	}

	accessToken := res.GetAccessToken()
	itemID := res.GetItemId()

	viper.Set("plaid.access_token", accessToken)
	viper.Set("plaid.item_id", itemID)

	return viper.WriteConfig()
}
