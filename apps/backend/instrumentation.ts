import { registerOtel } from "@medusajs/medusa"

// Sentry instrumentation — only active when SENTRY_DSN is set
if (process.env.SENTRY_DSN) {
  const Sentry = require("@sentry/node")
  const otelApi = require("@opentelemetry/api")
  const { SentrySpanProcessor, SentryPropagator } = require("@sentry/opentelemetry-node")
  const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc")

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    // @ts-ignore
    instrumenter: "otel",
  })

  otelApi.propagation.setGlobalPropagator(new SentryPropagator())

  exports.register = function register() {
    registerOtel({
      serviceName: "calilean-backend",
      spanProcessors: [new SentrySpanProcessor()],
      traceExporter: new OTLPTraceExporter(),
      instrument: {
        http: true,
        workflows: true,
        query: true,
        db: true,
      },
    })
  }
}
