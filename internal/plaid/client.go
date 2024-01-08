package plaid

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"path"

	"github.com/spf13/viper"

	"github.com/plaid/plaid-go/v20/plaid"
)

type APIClient struct {
	*plaid.APIClient
	ctx         context.Context
	accessToken string
	cacheDir    string
	isSandBox   bool
}

func UseSandbox() bool {
	return true
}

func NewClientFromConfig(ctx context.Context, isSandbox bool) (*APIClient, error) {
	clientID := viper.GetString("plaid.client_id")
	if clientID == "" {
		return nil, errors.New("plaid.client_id is not set")
	}

	secret := viper.GetString("plaid.secret")
	if isSandbox {
		sandboxSecret := viper.GetString("plaid.sandbox_secret")
		if sandboxSecret == "" {
			return nil, errors.New("plaid.sandbox_secret is not set")
		}
		secret = sandboxSecret
	}
	if secret == "" {
		return nil, errors.New("plaid.secret is not set")
	}

	accessToken := viper.GetString("plaid.access_token")
	if accessToken == "" {
		return nil, errors.New("plaid.access_token is not set")
	}

	jsonStorage := viper.GetString("storage.json")
	if jsonStorage == "" {
		return nil, errors.New("storage.json is not set")
	}

	info, err := os.Stat(jsonStorage)

	if os.IsNotExist(err) {
		log.Println("creating json storage directory", jsonStorage)
		if err := os.MkdirAll(path.Join(jsonStorage, "transactions"), 0755); err != nil {
			return nil, err
		}
		if err := os.MkdirAll(path.Join(jsonStorage, "accounts"), 0755); err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	} else if !info.IsDir() {
		return nil, errors.New("json storage is not a directory")
	}

	return newClient(ctx, clientID, secret, accessToken, jsonStorage, isSandbox)
}

func newClient(ctx context.Context, clientID string, secret string, accessToken string, cacheDir string, isSandbox bool) (*APIClient, error) {
	configuration := plaid.NewConfiguration()
	configuration.AddDefaultHeader("PLAID-CLIENT-ID", clientID)
	configuration.AddDefaultHeader("PLAID-SECRET", secret)

	var client *plaid.APIClient
	if isSandbox {
		configuration.UseEnvironment(plaid.Sandbox)
		client = plaid.NewAPIClient(configuration)

		sandboxPublicTokenResp, _, err := client.PlaidApi.SandboxPublicTokenCreate(ctx).SandboxPublicTokenCreateRequest(
			*plaid.NewSandboxPublicTokenCreateRequest(
				"ins_109508",
				[]plaid.Products{plaid.PRODUCTS_TRANSACTIONS},
			),
		).Execute()

		if err != nil {
			if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
				return nil, errors.New(plaidErr.GetErrorMessage())
			} else {
				return nil, err
			}
		}

		exchangePublicTokenResp, _, err := client.PlaidApi.ItemPublicTokenExchange(ctx).ItemPublicTokenExchangeRequest(
			*plaid.NewItemPublicTokenExchangeRequest(sandboxPublicTokenResp.GetPublicToken()),
		).Execute()
		if err != nil {
			return nil, err
		}

		accessToken = exchangePublicTokenResp.GetAccessToken()
		cacheDir = path.Join(cacheDir, "__SANDBOX__")

		if err := os.MkdirAll(cacheDir, 0755); err != nil {
			return nil, err
		}
	} else {
		configuration.UseEnvironment(plaid.Development)
		client = plaid.NewAPIClient(configuration)
	}

	return &APIClient{
		APIClient:   client,
		ctx:         ctx,
		accessToken: accessToken,
		cacheDir:    cacheDir,
	}, nil
}

func GetNextCursor(ctx context.Context, bytes []byte) (string, error) {
	syncResponse := &plaid.TransactionsSyncResponse{}
	if err := json.Unmarshal(bytes, syncResponse); err != nil {
		return "", err
	}

	return syncResponse.GetNextCursor(), nil
}
