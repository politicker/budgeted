# Go Backend Template

This template repo is a starting place for any Go backends I write. It is
largely inspired by the beautifully written
[apollo-backend](github.com/christianselig/apollo-backend) (RIP 🪦).

# Project structure

Most of the interesting bits live in the `internal` directory. I based the
structure off the apollo-backend source as well as
[this blog post](https://go.dev/doc/modules/layout) from the Go team about
organizing a project. It's not prescriptive but it serves as a good starting
point.

The top-level `cmd` folder contains a binary that serves as the entrypoint to
the entire codebase. It proxies commands into `internal/cmd` which contains the
domain-specific commands like `worker`, `api`, and `scheduler`. Each of those
commands take their own flags and arguments to specify behavior.

# Dependencies

- [datadog-go](https://github.com/DataDog/datadog-go) - logs and metrics
- [gocron](https://github.com/go-co-op/gocron) - cron jobs
- [gorilla/mux](https://github.com/gorilla/mux) - http routing
- [sqlc](https://github.com/sqlc-dev/sqlc) - statically generate type-safe query
  functions
- [pgx](https://github.com/jackc/pgx) - postgres driver
- [cobra](https://github.com/spf13/cobra) - CLI architecture
- [zap](https://github.com) - logging
- [sentry](https://github.com/getsentry/sentry-go) - error monitoring and
  alerting

# Running services

The top-level `cmd` directory contains the entrypoint CLI to run all of the
services. Each service exposes its own CLI that can take whatever flags &
arguments it needs.

To run a service, use the root CLI like so:

```bash
go-backend-template api --with-flags args

go-backend-template worker --queue send-emails
```

This repo includes run configurations for VS Code as well, which allows you to
run & debug the services from within the editor.
