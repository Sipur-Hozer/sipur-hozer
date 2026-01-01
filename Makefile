# location: ./Makefile

# --- Variables ---
COMPOSE_FILE=./deploy/docker-compose.yml
SCRIPT_FILE=./scripts/open_app.sh

BACKEND_DIR=./backend
FRONTEND_DIR=./frontend 

.PHONY: all
all: help

# --- Development Builds (Zero Local Dependencies) ---
# These commands use temporary containers to build and test code.
# No local Go or Node installation is required.

.PHONY: build
build:
	@echo "🏗️  Building Project (using Docker build-tools)..."
	@$(MAKE) -C $(BACKEND_DIR) build
	@$(MAKE) -C $(FRONTEND_DIR) build
	@echo "✅ Build complete (Artifacts created locally)."

.PHONY: lint
lint:
	@echo "🔍 Linting Project (inside Docker)..."
	@$(MAKE) -C $(BACKEND_DIR) lint
	@$(MAKE) -C $(FRONTEND_DIR) lint
	@echo "✅ Lint complete."

.PHONY: test
test:
	@echo "🧪 Testing Project (inside Docker)..."
	@$(MAKE) -C $(BACKEND_DIR) test
	@$(MAKE) -C $(FRONTEND_DIR) test
	@echo "✅ All tests passed."

.PHONY: clean-local
clean-local:
	@$(MAKE) -C $(BACKEND_DIR) clean
	@$(MAKE) -C $(FRONTEND_DIR) clean

# --- Docker Orchestration (Running the App) ---

.PHONY: run
run:
	@echo "🚀 Starting App (Full Docker Environment)..."
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "Running launch script..."
	@bash $(SCRIPT_FILE) || echo "Script failed, but containers are running."
	@echo "✅ App is running!"

.PHONY: stop
stop:
	@echo "🛑 Stopping containers..."
	docker-compose -f $(COMPOSE_FILE) down

.PHONY: logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: clean
clean: clean-local
	@echo "🧹 Cleaning Docker resources..."
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans

.PHONY: help
help:
	@echo "Usage (Zero Local Deps Mode):"
	@echo "  make build    - Compile code using temporary Docker containers"
	@echo "  make test     - Run tests using temporary Docker containers"
	@echo "  make run      - Run the full app via Docker Compose"
	@echo "  make stop     - Stop the app"