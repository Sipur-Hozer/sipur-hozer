# location: backend/Makefile
BINARY_NAME=server

# Run Go inside a container with persistent volumes for modules and build cache
DOCKER_RUN=docker run --rm \
	-v "$(PWD):/app" \
	-w /app \
	-v go-modules:/go/pkg/mod \
	-v go-build-cache:/root/.cache/go-build \
	golang:1.24-alpine

.PHONY: all
all: build test

.PHONY: build
build:
	@echo "🐘 Building Go Backend (inside Docker)..."
	# Build a Linux binary compatible with the final Docker image and WSL
	$(DOCKER_RUN) sh -c "CGO_ENABLED=0 GOOS=linux go build -o bin/$(BINARY_NAME) main.go"

.PHONY: test
test:
	@echo "🧪 Running Backend Tests (inside Docker)..."
	$(DOCKER_RUN) go test -v ./...

.PHONY: lint
lint:
	@echo "🔍 Linting Backend (inside Docker)..."
	$(DOCKER_RUN) go vet ./...

.PHONY: deps
deps:
	@echo "📦 Updating Backend dependencies (inside Docker)..."
	$(DOCKER_RUN) go mod tidy

.PHONY: clean
clean:
	rm -rf bin