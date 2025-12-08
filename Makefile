# --- Variables ---
COMPOSE_FILE=./deploy/docker-compose.yml
SCRIPT_FILE=./scripts/open_app.sh

BACKEND_DIR=./backend
# CHANGE THIS LINE: Remove "/app" from the end
FRONTEND_DIR=./frontend 

# ... rest of file is unchanged

.PHONY: all
all: help

# --- Local Development (No Docker) ---

.PHONY: build
build:
	@echo "🏗️  Building entire project locally..."
	@$(MAKE) -C $(BACKEND_DIR) build
	@$(MAKE) -C $(FRONTEND_DIR) build
	@echo "✅ Build complete."

.PHONY: lint
lint:
	@echo "🔍 Linting entire project..."
	@$(MAKE) -C $(BACKEND_DIR) lint
	@$(MAKE) -C $(FRONTEND_DIR) lint
	@echo "✅ Lint complete."

.PHONY: clean-local
clean-local:
	@$(MAKE) -C $(BACKEND_DIR) clean
	@$(MAKE) -C $(FRONTEND_DIR) clean

# --- Docker Orchestration (Original Commands) ---

.PHONY: run
run:
	@echo "Starting Docker containers in background..."
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "Running launch script..."
	@bash $(SCRIPT_FILE)
	@echo "✅ App is running! Terminal is free."
	@echo "👉 Type 'make stop' when you are done."
	@echo "👉 Type 'make logs' if you need to see server output."

.PHONY: stop
stop:
	@echo "Stopping containers..."
	docker-compose -f $(COMPOSE_FILE) down
	@echo "🛑 App stopped."

.PHONY: logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: images
images:
	docker-compose -f $(COMPOSE_FILE) build

.PHONY: shell-back
shell-back:
	docker-compose -f $(COMPOSE_FILE) exec backend /bin/sh

.PHONY: shell-front
shell-front:
	docker-compose -f $(COMPOSE_FILE) exec frontend /bin/sh

.PHONY: clean
clean: clean-local
	@echo "🧹 Cleaning Docker resources..."
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans

.PHONY: help
help:
	@echo "Usage:"
	@echo "  --- Local Dev ---"
	@echo "  make build    - Compile Backend and Frontend locally"
	@echo "  make lint     - Lint code for both"
	@echo "  --- Docker ---"
	@echo "  make run      - Start app in Docker and open browser"
	@echo "  make stop     - Stop Docker application"
	@echo "  make logs     - View Docker logs"
	@echo "  make clean    - Deep clean (Local build files + Docker volumes)"