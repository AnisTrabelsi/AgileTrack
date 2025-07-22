// metrics-service/cmd/server/main_test.go
package main

import (
  "net/http/httptest"
  "testing"
)

func TestMetricsEndpoint(t *testing.T) {
  mux := setupRouter() // ta func qui build le router
  w   := httptest.NewRecorder()
  req := httptest.NewRequest("GET", "/metrics", nil)
  mux.ServeHTTP(w, req)
  if w.Code != 200 {
    t.Fatalf("expected 200, got %d", w.Code)
  }
}
