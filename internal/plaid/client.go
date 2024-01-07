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
	cacheDir    string
}

func UseSandbox() bool {
	return true
}

func NewClient(args ...func() bool) *plaid.APIClient {
	configuration := plaid.NewConfiguration()
	configuration.AddDefaultHeader("PLAID-CLIENT-ID", viper.GetString("plaid.client_id"))
	configuration.AddDefaultHeader("PLAID-SECRET", viper.GetString("plaid.secret"))

	for _, arg := range args {
		if arg() {
			//log.Println(viper.GetString("plaid.sandbox_secret"))
			configuration.AddDefaultHeader("PLAID-SECRET", viper.GetString("plaid.sandbox_secret"))
			//configuration.AddDefaultHeader("PLAID-SANDBOX-SECRET", viper.GetString("plaid.sandbox_secret"))
			configuration.UseEnvironment(plaid.Sandbox)
			return plaid.NewAPIClient(configuration)
		}
	}

	configuration.AddDefaultHeader("PLAID-SECRET", viper.GetString("plaid.secret"))
	configuration.UseEnvironment(plaid.Development)

	return APIClient{
		APIClient: plaid.NewAPIClient(configuration)}
}

func (pc *APIClient) SetCacheStorage(path string) {
	pc.cacheDir = path
}

func (pc *APIClient) SetAccessToken(token string) {
	pc.accessToken = token
}

func GetNextCursor(ctx context.Context, bytes []byte) (string, error) {
	syncResponse := &plaid.TransactionsSyncResponse{}
	if err := json.Unmarshal(bytes, syncResponse); err != nil {
		return "", err
	}

	return syncResponse.GetNextCursor(), nil
}
