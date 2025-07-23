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

var (
	demoGauge = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Namespace: "devopstrack",
			Name:      "demo_value",
			Help:      "Exemple de métrique exportée et envoyée à InfluxDB",
		},
	)
)

func main() {
	// --- Prometheus ---
	prometheus.MustRegister(demoGauge)
	http.Handle("/metrics", promhttp.Handler())

	// --- InfluxDB ---
	influxURL := os.Getenv("INFLUXDB_URL")
	influxOrg := os.Getenv("INFLUXDB_ORG")
	influxBucket := os.Getenv("INFLUXDB_BUCKET")
	influxToken := os.Getenv("INFLUXDB_TOKEN")

	if influxURL == "" || influxOrg == "" || influxBucket == "" || influxToken == "" {
		log.Fatal("⛔️ Variables d'environnement InfluxDB manquantes. Vérifie INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN.")
	}

	client := influxdb2.NewClient(influxURL, influxToken)
	defer client.Close()
	writeAPI := client.WriteAPIBlocking(influxOrg, influxBucket)

	// boucle : met à jour la gauge + écrit dans Influx
	go func() {
		for {
			val := float64(time.Now().Second())
			demoGauge.Set(val)

			p := influxdb2.NewPoint(
				"demo_value",
				nil,
				map[string]interface{}{"value": val},
				time.Now(),
			)
			if err := writeAPI.WritePoint(context.Background(), p); err != nil {
				log.Println("write point:", err)
			}
			time.Sleep(10 * time.Second)
		}
	}()

	log.Println("metrics-service listening on :9100")
	log.Fatal(http.ListenAndServe(":9100", nil))
}
