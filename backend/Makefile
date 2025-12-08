# location: backend/Makefile

# Binary name
BINARY_NAME=server

.PHONY: all
all: build test

.PHONY: build
build:
	@echo "🐘 Building Go Backend..."
	go build -o bin/$(BINARY_NAME) main.go

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