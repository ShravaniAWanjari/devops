// # instrumentation.js
// --- OpenTelemetry Tracing Setup (using OTLP/HTTP) ---

const { NodeSDK } = require('@opentelemetry/sdk-node');
// FIX: Import Resource explicitly from the resources package, as it's not directly exported by sdk-node
const { Resource } = require('@opentelemetry/resources'); 
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
// OTLP Exporter Configuration: Jaeger is set up to receive OTLP traces on port 4318 (HTTP)
const otlpExporter = new OTLPTraceExporter({
  // The service name from docker-compose is the hostname in the Docker network
  url: 'http://jaeger_collector:4318/v1/traces',
});

const sdk = new NodeSDK({
  // Define the service name (This is what shows up in the Jaeger UI)
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'nodejs-metrics-app', 
  }),
  
  traceExporter: otlpExporter,

  // Enable automatic instrumentation for HTTP and Express requests
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        // Exclude the /metrics endpoint from tracing
        ignoreIncomingRequestHook: (req) => req.url === '/metrics', 
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      }
    }),
  ],
});

sdk.start();

console.log('OpenTelemetry SDK initialized. Traces ready for Jaeger via OTLP.');
