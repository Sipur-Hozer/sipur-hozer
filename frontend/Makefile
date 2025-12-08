# location: frontend/app/Makefile

.PHONY: all
all: build

# 1. Build using your existing Dockerfile
# This runs the "builder" stage defined in your Dockerfile 
.PHONY: build
build:
	@echo "🐳 Building Frontend Image..."
	docker build -t sipur-frontend .

# 2. Lint using a temporary container
# We still need 'docker run' here because your Dockerfile doesn't have a specific "lint" output.
.PHONY: lint
lint:
	@echo "🔍 Linting Frontend..."
	docker run --rm \
		-v "$(PWD):/app" \
		-w /app \
		node:20-alpine \
		sh -c "npm install && npm run lint"

.PHONY: clean
clean:
	@echo "🧹 Cleaning Docker artifacts..."
	docker rmi sipur-frontend || true