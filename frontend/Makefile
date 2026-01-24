# location: frontend/Makefile

# Use CURDIR to ensure we always get the correct folder path
PWD := $(CURDIR)

.PHONY: all
all: build

# 1. Build (Production Image)
.PHONY: build
build:
	@echo "🐳 Building Frontend Image..."
	docker build --target runner -t sipur-frontend .

# 2. Lint
.PHONY: lint
lint:
	@echo "🔍 Linting Frontend..."
	docker build --target linter -t sipur-frontend-lint .

# 3. Test
# FIX: Added 'docker run' so the tests actually execute!
.PHONY: test
test:
	@echo "🧪 Testing Frontend..."
	docker build --target tester -t sipur-frontend-test .
	docker run --rm sipur-frontend-test

.PHONY: clean
clean:
	@echo "🧹 Cleaning Docker artifacts..."
	docker rmi sipur-frontend sipur-frontend-lint sipur-frontend-test || true