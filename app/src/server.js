require('./tracer');

const express = require('express');
const logger = require('./logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware simples para registrar todas as requisições
app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const durationMs = Date.now() - startTime;

        logger.info('HTTP request completed', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs,
        });
    });

    next();
});

app.get('/health', (req, res) => {
    logger.info('Health check executed');

    res.json({
        status: 'ok',
        service: 'poc-datadog-api',
        timestamp: new Date().toISOString(),
    });
});

app.get('/products', (req, res) => {
    logger.info('Products listed');

    res.json({
        products: [
            { id: 1, name: 'Notebook', price: 4500 },
            { id: 2, name: 'Mouse', price: 120 },
            { id: 3, name: 'Teclado', price: 250 },
        ],
    });
});

app.get('/slow', async (req, res) => {
    logger.warn('Slow endpoint started');

    await new Promise((resolve) => setTimeout(resolve, 3000));

    logger.warn('Slow endpoint finished');

    res.json({
        message: 'This response was intentionally delayed',
        delayMs: 3000,
    });
});

app.get('/error', (req, res) => {
    logger.error('Intentional error triggered');

    res.status(500).json({
        error: 'Intentional error for Datadog POC',
    });
});

// endpoint para simular um erro - esse é visto pelo dd como erro, marcando o span com erro.type etc
app.get('/throw', (req, res, next) => {
    logger.error('Intentional error triggered');
    next(new Error('Uncaught error for Datadog POC'));
})

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});