# Stage 1: Build the application
FROM golang:1.24-alpine AS builder

WORKDIR /app

# העתקת קבצי המודולים
COPY go.mod go.sum ./

# הרצת tidy ו-download כדי לסנכרן תלויות
RUN go mod download
COPY . .
RUN go mod tidy 

# בניית השרת
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Run the application
FROM alpine:latest
WORKDIR /root/
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/main .
COPY .env* ./ 

EXPOSE 8080
CMD ["./main"]