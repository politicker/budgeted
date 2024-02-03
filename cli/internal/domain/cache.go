package domain

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path"

	"github.com/pkg/errors"
)

func cacheFile(cache map[string]string, url string) (string, error) {
	name := path.Base(url)

	if _, ok := cache[name]; !ok {
		data, err := fetch(url)
		if err != nil {
			return "", errors.Wrapf(err, "fetch failed for %s", url)
		}

		err = os.WriteFile(
			path.Join("public", "cache", name),
			data,
			0o644,
		)
		if err != nil {
			return "", errors.Wrapf(err, "failed to write cache file for %s", url)
		}

		cache[name] = "cached"
	}

	return "./cache/" + name, nil
}

func fetch(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to fetch URL: %s", url)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to read response body for URL: %s", url)
	}

	return data, nil
}
