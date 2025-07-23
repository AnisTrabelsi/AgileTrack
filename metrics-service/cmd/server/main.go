// metrics‑service/cmd/server/main.go
//
//  • Expose /metrics pour Prometheus
//  • Push la même métrique dans InfluxDB v2 (“metrics” bucket)
// ------------------------------------------------------------------

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

/*───────────────────────────────────────────────────────────────
  Prometheus ‑ Gauge « demo_value »
───────────────────────────────────────────────────────────────*/
var demoGauge = prometheus.NewGauge(prometheus.GaugeOpts{
	Namespace: "devopstrack",
	Name:      "demo_value",
	Help:      "Exemple de métrique exportée (Prometheus) et stockée (InfluxDB)",
})

func init() { // registre la métrique au démarrage
	prometheus.MustRegister(demoGauge)
}

/*───────────────────────────────────────────────────────────────
  Helper : lit une variable d’env. ou plante
───────────────────────────────────────────────────────────────*/
func mustEnv(key string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	log.Fatalf("⛔️ variable d'environnement %s manquante", key)
	return ""
}

/*───────────────────────────────────────────────────────────────
  Router HTTP (exposé pour les tests unitaires)
───────────────────────────────────────────────────────────────*/
func setupRouter() http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	return mux
}

/*───────────────────────────────────────────────────────────────
  main
───────────────────────────────────────────────────────────────*/
func main() {
	/*—— Config InfluxDB (les noms DOIVENT correspondre au compose) ——*/
	url := mustEnv("INFLUXDB_URL")
	org := mustEnv("INFLUXDB_ORG")
	bucket := mustEnv("INFLUXDB_BUCKET")
	token := mustEnv("INFLUXDB_TOKEN")

	client := influxdb2.NewClient(url, token)
	defer client.Close()
	writeAPI := client.WriteAPIBlocking(org, bucket)

	/*—— Boucle : met à jour Prom + écrit un point InfluxDB ——*/
	go func() {
		for {
			val := float64(time.Now().Second())
			demoGauge.Set(val) // Prometheus

			pt := influxdb2.NewPoint(
				"demo_value",
				nil,
				map[string]interface{}{"value": val},
				time.Now(),
			)
			if err := writeAPI.WritePoint(context.Background(), pt); err != nil {
				log.Printf("❗ write InfluxDB : %v", err)
			}
			time.Sleep(10 * time.Second)
		}
	}()

	/*—— HTTP server ——*/
	log.Println("metrics‑service en écoute sur :9100 (/metrics)")
	if err := http.ListenAndServe(":9100", setupRouter()); err != nil {
		log.Fatalf("Serveur HTTP arrêté : %v", err)
	}
}
