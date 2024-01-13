package main

import (
	"context"
	"github.com/google/martian/log"
	"os"
	"os/signal"

	"github.com/politicker/budgeted/internal/cmd"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, os.Kill)
	defer cancel()

	err := cmd.Execute(ctx)
	if err != nil {
		log.Errorf("Error executing command: %v", err)
		os.Exit(1)
	}

	os.Exit(0)
}
