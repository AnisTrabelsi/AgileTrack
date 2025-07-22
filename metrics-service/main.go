package main

import (
	"context"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

/* -------------------------------------------------------------------------- */
/* > Configuration via variables d’environnement                              */
/* -------------------------------------------------------------------------- */

var (
	port         = getenv("PORT", "9100")
	influxURL    = getenv("INFLUX_URL", "http://metrics-db:8086")
	influxOrg    = getenv("INFLUX_ORG", "devopstrack")
	influxBucket = getenv("INFLUX_BUCKET", "metrics")
	influxToken  = getenv("INFLUX_TOKEN", "dev-token") // token ≈ root pour dev
)

/* -------------------------------------------------------------------------- */
/* > Prometheus metrics                                                       */
/* -------------------------------------------------------------------------- */

var (
	uptime = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "metrics_service_uptime_seconds",
		Help: "Seconds since the service started",
	})
	randomValue = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "metrics_service_random_value",
		Help: "Random value pushed every 10 s (demo)",
	})
)

func init() {
	prometheus.MustRegister(uptime, randomValue)
}

/* -------------------------------------------------------------------------- */
/* > Helpers                                                                  */
/* -------------------------------------------------------------------------- */

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

/* -------------------------------------------------------------------------- */
/* > setupRouter – utilisée dans le test                                      */
/* -------------------------------------------------------------------------- */

func setupRouter() http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	return mux
}

/* -------------------------------------------------------------------------- */
/* > main                                                                     */
/* -------------------------------------------------------------------------- */

func main() {
	start := time.Now()

	influx := influxdb2.NewClient(influxURL, influxToken)
	defer influx.Close()
	writer := influx.WriteAPIBlocking(influxOrg, influxBucket)

	go func() {
		tick := time.NewTicker(10 * time.Second)
		defer tick.Stop()

		for t := range tick.C {
			uptime.Set(time.Since(start).Seconds())
			randVal := rand.Float64()
			randomValue.Set(randVal)

			p := influxdb2.NewPoint(
				"demo_random",
				map[string]string{"service": "metrics"},
				map[string]interface{}{"value": randVal},
				t,
			)
			if err := writer.WritePoint(context.Background(), p); err != nil {
				log.Println("influx write:", err)
			}
		}
	}()

	log.Printf("Metrics-Service listening on :%s/metrics", port)
	if err := http.ListenAndServe(":"+port, setupRouter()); err != nil {
		log.Fatal(err)
	}
}
