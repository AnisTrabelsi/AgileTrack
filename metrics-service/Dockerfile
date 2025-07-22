# ---- build stage -------------------------------------------------
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /metrics-service ./cmd/server

# ---- runtime stage (distroless) ---------------------------------
FROM gcr.io/distroless/static
COPY --from=build /metrics-service /metrics-service
EXPOSE 9100
ENTRYPOINT ["/metrics-service"]
