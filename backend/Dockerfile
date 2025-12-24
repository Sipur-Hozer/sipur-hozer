# Stage 1: Build the application
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy dependency files first
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build a static binary
# CGO_ENABLED=0 ensures the binary works on any Linux system
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Run the application
FROM alpine:latest

WORKDIR /root/

# CRITICAL FIX: Install SSL certificates for Cloud Database connection
RUN apk add --no-cache ca-certificates

# Copy the binary from builder
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]