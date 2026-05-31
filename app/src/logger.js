const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        service: 'poc-datadog-api',
        environment: 'development',
    },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

module.exports = logger;