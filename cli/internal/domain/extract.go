package domain

import (
	"context"
	"errors"
	"fmt"

	"github.com/politicker/budgeted/internal/cmdutil"
	"github.com/politicker/budgeted/internal/db"
	"github.com/politicker/budgeted/internal/plaid"
)

func ExtractPlaidData(ctx context.Context, pc *plaid.APIClient, db *db.Queries) error {
	institutions, err := db.InstitutionList(ctx)
	if err != nil {
		return err
	}

	for _, institution := range institutions {
		err = pc.LoadTransactions(ctx, institution.PlaidId, institution.PlaidAccessToken)

		if err != nil {
			return fmt.Errorf("failed to load transactions: %w", err)
		}

		err = pc.LoadAccounts(ctx, institution.PlaidId, institution.PlaidAccessToken)
		if err != nil {
			return fmt.Errorf("failed to load accounts: %w", err)
		}
	}

	return nil
}

func PlaidClientFromConfig(ctx context.Context, isSandbox bool, queries *db.Queries) (*plaid.APIClient, error) {
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

	return plaid.NewClient(ctx, clientID, secret, jsonStorage, isSandbox)
}
