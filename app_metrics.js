// # app_metrics.js
// --- Prometheus Metrics Instrumentation (prom-client) ---

const express = require('express');
const client = require('prom-client');
const app = express();
const PORT = 3000;

// 1. Create a Registry
const register = new client.Registry();

// 2. Enable collection of default Node.js metrics (CPU, memory, GC, etc.)
client.collectDefaultMetrics({ 
    app: 'nodejs-metrics-app',
    prefix: 'node_',
    timeout: 10000,
    register
});

// 3. Define a Custom Counter: Tracks total requests
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// 4. Custom Middleware for Metrics Collection
app.use((req, res, next) => {
  res.on('finish', () => {
    // Increment the counter on response finish
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
  });
  next();
});

// 5. Application Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Observability Demo App!');
});

app.get('/api/data', (req, res) => {
  res.status(200).json({ message: 'Data fetched successfully' });
});

app.get('/api/error', (req, res) => {
  res.status(500).send('Internal Server Error simulation');
});

// 6. Expose /metrics Endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Application listening at http://localhost:${PORT}`);
  console.log(`Metrics exposed at http://localhost:${PORT}/metrics`);
});