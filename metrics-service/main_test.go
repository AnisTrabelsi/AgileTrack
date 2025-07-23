// metrics-service/cmd/server/main_test.go
//
// Test unitaire très simple : vérifie que l’endpoint /metrics
// répond bien 200 OK.  Il suffit d’exposer ton handler via la
// fonction NewRouter() qui renvoie un http.Handler (mux, chi,
// gin, echo… peu importe).

package server_test // ← même package que le code testé (souvent server)

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

// remplace NewRouter par ta factory (setupRouter, InitRouter, …)
func NewRouter() http.Handler {
	// Exemple minimal : expose promhttp.Handler()
	//   mux := http.NewServeMux()
	//   mux.Handle("/metrics", promhttp.Handler())
	//   return mux
	//
	// Dans ton projet c’est sûrement une fonction déjà existante.
	panic("TODO: renvoie ton router")
}

func TestMetricsEndpoint(t *testing.T) {
	router := NewRouter()

	req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GET /metrics attendu 200, obtenu %d", rec.Code)
	}
}
