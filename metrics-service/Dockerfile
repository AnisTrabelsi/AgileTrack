# --- build stage ---
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/metrics-service ./cmd/server

# --- runtime stage ---
FROM alpine:3.20
EXPOSE 9100     # port Prometheus
ENTRYPOINT ["/metrics-service"]
COPY --from=build /bin/metrics-service /metrics-service
