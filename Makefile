SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE := docker compose
BACKEND_ENV := apps/backend/.env
WEB_ENV := apps/web/.env

.PHONY: help dev setup deps-up deps-down model logs

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# Starts Docker services, the backend and the web app. Ctrl+C (or any exit,
# including a crash) stops the apps and runs `docker compose down`.
# Data volumes are kept between runs.
dev: setup ## Start everything for development; Ctrl+C tears it all down
	@set -e; \
	cleanup() { \
		trap - EXIT INT TERM; \
		echo; echo "==> Stopping Docker services"; \
		$(COMPOSE) down; \
	}; \
	trap cleanup EXIT; \
	trap 'exit 0' INT TERM; \
	echo "==> Starting Docker services"; \
	$(COMPOSE) up -d --wait; \
	$(MAKE) --no-print-directory model; \
	echo "==> Starting backend (:8000) and web (:3000)"; \
	npm run dev

setup: ## Install dependencies and create .env files if missing
	@[ -d node_modules ] || npm install
	@[ -f $(BACKEND_ENV) ] || { cp apps/backend/.env.example $(BACKEND_ENV); echo "Created $(BACKEND_ENV)"; }
	@[ -f $(WEB_ENV) ] || { cp apps/web/.env.example $(WEB_ENV); echo "Created $(WEB_ENV)"; }

deps-up: ## Start Docker services only (detached)
	$(COMPOSE) up -d --wait

deps-down: ## Stop Docker services
	$(COMPOSE) down

# Pulls the Ollama model named by OPENAI_MODEL in the backend .env, if the
# backend points at the local Ollama and the model isn't there yet.
model: ## Pull the Ollama model if missing
	@model=$$(grep -E '^OPENAI_MODEL=' $(BACKEND_ENV) | cut -d= -f2-); \
	base=$$(grep -E '^OPENAI_BASE_URL=' $(BACKEND_ENV) | cut -d= -f2-); \
	if [ -n "$$model" ] && [[ "$$base" == *11434* ]]; then \
		if ! $(COMPOSE) exec -T ollama ollama list | awk 'NR>1 {print $$1}' | grep -qE "^$$model(:|$$)"; then \
			echo "==> Pulling Ollama model $$model"; \
			$(COMPOSE) exec -T ollama ollama pull "$$model"; \
		fi; \
	fi

logs: ## Follow Docker service logs
	$(COMPOSE) logs -f
