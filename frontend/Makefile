# location: frontend/Makefile

# Use CURDIR to ensure we always get the correct folder path
PWD := $(CURDIR)

.PHONY: all
all: build

# 1. Build (Production Image)
# Targets the 'runner' stage in Dockerfile
.PHONY: build
build:
	@echo "🐳 Building Frontend Image..."
	docker build --target runner -t sipur-frontend .

# 2. Lint
# Targets the 'linter' stage in Dockerfile
.PHONY: lint
lint:
	@echo "🔍 Linting Frontend..."
	docker build --target linter -t sipur-frontend-lint .

# 3. Test
# Targets the 'tester' stage in Dockerfile
# Reuses the cached dependencies from the 'base' stage!
.PHONY: test
test:
	@echo "🧪 Testing Frontend..."
	docker build --target tester -t sipur-frontend-test .

.PHONY: clean
clean:
	@echo "🧹 Cleaning Docker artifacts..."
	docker rmi sipur-frontend sipur-frontend-lint sipur-frontend-test || true