# location: frontend/Makefile

PWD := $(CURDIR)

.PHONY: all
all: build

# 1. Build the production app
# We target 'runner' (the final stage) to get the ready-to-use server
.PHONY: build
build:
	@echo "🐳 Building Frontend Image..."
	docker build --target runner -t sipur-frontend .

# 2. Run Lint
# We target 'linter'. Docker will ensure dependencies are installed (cached),
# copy your latest code, and run the lint check. 
# If lint fails, the 'docker build' command will fail.
.PHONY: lint
lint:
	@echo "🔍 Linting Frontend..."
	docker build --target linter -t sipur-frontend-lint .

.PHONY: clean
clean:
	@echo "🧹 Cleaning Docker artifacts..."
	docker rmi sipur-frontend sipur-frontend-lint || true