package plaid

import (
	"context"
	"encoding/json"

	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/spf13/viper"
)

type APIClient struct {
	*plaid.APIClient
	accessToken string
}

func NewClient(accessToken string) APIClient {
	configuration := plaid.NewConfiguration()
	configuration.AddDefaultHeader("PLAID-CLIENT-ID", viper.GetString("plaid.client_id"))
	configuration.AddDefaultHeader("PLAID-SECRET", viper.GetString("plaid.secret"))
	configuration.UseEnvironment(plaid.Development)

	return APIClient{
		accessToken: accessToken,
		APIClient:   plaid.NewAPIClient(configuration)}
}

func GetNextCursor(ctx context.Context, bytes []byte) (string, error) {
	syncResponse := &plaid.TransactionsSyncResponse{}
	if err := json.Unmarshal(bytes, syncResponse); err != nil {
		return "", err
	}

	return syncResponse.GetNextCursor(), nil
}
