# Makefile

COMPOSE_FILE=./deploy/docker-compose.yml
SCRIPT_FILE=./scripts/open_app.sh

.PHONY: all
all: help

# --- Main Commands ---

# 1. Start everything and return control to the user
.PHONY: run
run:
	@echo "Starting Docker containers in background..."
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "Running launch script..."
	@bash $(SCRIPT_FILE)
	@echo "✅ App is running! Terminal is free."
	@echo "👉 Type 'make stop' when you are done."
	@echo "👉 Type 'make logs' if you need to see server output."

# 2. Stop the app
.PHONY: stop
stop:
	@echo "Stopping containers..."
	docker-compose -f $(COMPOSE_FILE) down
	@echo "🛑 App stopped."

# --- Build Specifics ---

.PHONY: images
images:
	docker-compose -f $(COMPOSE_FILE) build

.PHONY: clean
clean:
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all --remove-orphans

# --- Utilities ---

.PHONY: logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: shell-back
shell-back:
	docker-compose -f $(COMPOSE_FILE) exec backend /bin/sh

.PHONY: shell-front
shell-front:
	docker-compose -f $(COMPOSE_FILE) exec frontend /bin/sh

.PHONY: help
help:
	@echo "Usage:"
	@echo "  make run      - Start app and open browser (frees terminal)"
	@echo "  make stop     - Stop application"
	@echo "  make logs     - View server logs"
	@echo "  make clean    - Deep clean (delete volumes/images)"