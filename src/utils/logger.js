const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

function initLogger(logPath = './logs/monitor.log') {
    const absolutePath = path.resolve(logPath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

    function log(level, message) {
        const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

        fs.appendFileSync(absolutePath, logMessage);
        console[level](logMessage.trim());
    }

    return {
        info: (message) => log('info', message),
        error: (message) => log('error', message),
        warn: (message) => log('warn', message),
        debug: (message) => log('debug', message)
    };
}

module.exports = { initLogger };