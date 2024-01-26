package plaid

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/plaid/plaid-go/v20/plaid"
	"github.com/politicker/budgeted/internal/cmdutil"
	"github.com/politicker/budgeted/internal/db"
)

type APIClient struct {
	*plaid.APIClient
	ctx       context.Context
	cacheDir  string
	isSandBox bool
}

func UseSandbox() bool {
	return true
}

func NewClientFromConfig(ctx context.Context, isSandbox bool, queries *db.Queries) (*APIClient, error) {
	config, err := queries.ConfigGet(ctx)
	if err != nil {
		return nil, err
	}

	clientID := config.PlaidClientId
	secret := config.PlaidSecret
	if clientID == "" {
		return nil, errors.New("Config.PlaidClientId id is empty")
	}
	if secret == "" {
		return nil, errors.New("Config.PlaidSecret is empty")
	}

	jsonStorage, _, err := cmdutil.Dirs()
	if err != nil {
		return nil, err
	}

	return newClient(ctx, clientID, secret, jsonStorage, isSandbox)
}

func newClient(ctx context.Context, clientID string, secret string, cacheDir string, isSandbox bool) (*APIClient, error) {
	configuration := plaid.NewConfiguration()
	configuration.AddDefaultHeader("PLAID-CLIENT-ID", clientID)
	configuration.AddDefaultHeader("PLAID-SECRET", secret)

	var client *plaid.APIClient
	if isSandbox {
		// configuration.UseEnvironment(plaid.Sandbox)
		// client = plaid.NewAPIClient(configuration)

		// sandboxPublicTokenResp, _, err := client.PlaidApi.SandboxPublicTokenCreate(ctx).SandboxPublicTokenCreateRequest(
		// 	*plaid.NewSandboxPublicTokenCreateRequest(
		// 		"ins_109508",
		// 		[]plaid.Products{plaid.PRODUCTS_TRANSACTIONS},
		// 	),
		// ).Execute()

		// if err != nil {
		// 	if plaidErr, innerErr := plaid.ToPlaidError(err); innerErr == nil {
		// 		return nil, errors.New(plaidErr.GetErrorMessage())
		// 	} else {
		// 		return nil, err
		// 	}
		// }

		// exchangePublicTokenResp, _, err := client.PlaidApi.ItemPublicTokenExchange(ctx).ItemPublicTokenExchangeRequest(
		// 	*plaid.NewItemPublicTokenExchangeRequest(sandboxPublicTokenResp.GetPublicToken()),
		// ).Execute()
		// if err != nil {
		// 	return nil, err
		// }

		// accessToken := exchangePublicTokenResp.GetAccessToken()
		// cacheDir = path.Join(cacheDir, "__SANDBOX__")

		// if err := os.MkdirAll(cacheDir, 0755); err != nil {
		// 	return nil, err
		// }
	} else {
		configuration.UseEnvironment(plaid.Development)
		client = plaid.NewAPIClient(configuration)
	}

	return &APIClient{
		APIClient: client,
		ctx:       ctx,
		cacheDir:  cacheDir,
	}, nil
}

func GetNextCursor(ctx context.Context, bytes []byte) (string, error) {
	syncResponse := &plaid.TransactionsSyncResponse{}
	if err := json.Unmarshal(bytes, syncResponse); err != nil {
		return "", err
	}

	return syncResponse.GetNextCursor(), nil
}
