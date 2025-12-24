# Binary name
BINARY_NAME=server

.PHONY: all
all: build test

# Build the project locally (if you ever need to)
.PHONY: build
build:
	@echo "🐘 Building Go Backend..."
	go build -o bin/$(BINARY_NAME) main.go

# NEW: Run this to install libraries via Docker without installing Go locally
# Usage: make deps
.PHONY: deps
deps:
	@echo "📦 Updating dependencies via Docker..."
	docker run --rm -v "$(PWD)":/app -w /app golang:1.24-alpine \
		go get github.com/lib/pq golang.org/x/crypto/bcrypt

.PHONY: lint
lint:
	@echo "🔍 Linting Backend..."
	go vet ./...

.PHONY: test
test:
	@echo "🧪 Running Backend Tests..."
	go test -v ./...

.PHONY: clean
clean:
	@echo "🧹 Cleaning Backend..."
	rm -rf bin