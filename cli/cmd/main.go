package main

import (
	"context"
	"log"
	"os"
	"os/signal"

	"github.com/politicker/budgeted/internal/cmd"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, os.Kill)
	defer cancel()

	err := cmd.Execute(ctx)
	if err != nil {
		log.Fatalf("Error executing command: %v", err)
		os.Exit(1)
	}

	os.Exit(0)
}
