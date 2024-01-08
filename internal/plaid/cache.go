package plaid

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/plaid/plaid-go/v20/plaid"
)

func (pc *APIClient) GetNextCursor(ctx context.Context, prefix string) (string, error) {
	// Read the cached response body from the file
	data, err := pc.GetCache(ctx, prefix)
	if err != nil {
		return "", err
	}

	syncResponse := &plaid.TransactionsSyncResponse{}
	if err := json.Unmarshal(data, syncResponse); err != nil {
		return "", err
	}
	return syncResponse.GetNextCursor(), nil
}

func (pc *APIClient) GetCache(ctx context.Context, path string) ([]byte, error) {
	var lastEntry os.DirEntry
	cachePath := pc.cacheDir + "/" + path

	entries, err := os.ReadDir(cachePath)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		if lastEntry == nil || lastEntry.Name() < entry.Name() {
			lastEntry = entry
		}
	}

	if lastEntry != nil {
		bytes, err := os.ReadFile(fmt.Sprintf("%s/%s", cachePath, lastEntry.Name()))
		if err != nil {
			return nil, err
		}

		return bytes, nil
	}

	return nil, errors.New("no cached response found")
}

func (pc *APIClient) SetCache(ctx context.Context, path string, cursor string, bytes []byte) error {
	timestamp := strings.Replace(time.Now().Format(time.RFC3339Nano), ":", "X", -1)
	cachePath := pc.cacheDir + "/" + path
	fileName := fmt.Sprintf("%s/%s_%s.json", cachePath, timestamp, cursor)

	log.Println("writing", fileName)
	if err := os.WriteFile(fileName, bytes, 0644); err != nil {
		return err
	}

	return nil
}
