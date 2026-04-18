'use strict';

const logLevels = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const log = (level, message) => {
    const timestamp = new Date().toISOString();
    if (logLevels[level]) {
        console.log(`[${timestamp}] [${level}] ${message}`);
    } else {
        console.error(`[${timestamp}] [INVALID LEVEL] ${message}`);
    }
};

module.exports = {
    error: (msg) => log('ERROR', msg),
    warn: (msg) => log('WARN', msg),
    info: (msg) => log('INFO', msg),
    debug: (msg) => log('DEBUG', msg)
};