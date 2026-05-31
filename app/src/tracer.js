const tracer = require('dd-trace').init({
    service: process.env.DD_SERVICE || 'poc-datadog-api', // lê a variável DD_SERVICE ou cai no fallback poc-datadog-api
    env: process.env.DD_ENV || 'development', // lê a variável DD_ENV ou cai no fallback development
    version: process.env.DD_VERSION || '1.0.0', // lê a variável DD_VERSION ou cai no fallback 0.1.0
    logInjection: true, // faz com que o dd-trace injete automaticamente os campos trace_id, span_id, service, env e version em cada log
    runtimeMetrics: true, // habilita a coleta de métricas (heap, GC, event loop lag etc) do runtime no Node
});

module.exports = tracer;