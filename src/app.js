const TelegramBot = require('node-telegram-bot-api');
const { loadConfig } = require('./utils/config-loader');
const { initLogger } = require('./utils/logger');
const { setupCommands } = require('./bot/commands');
const { initMonitoring } = require('./monitoring/monitor');

async function startApp() {
    try {
        const config = await loadConfig();
        const logger = initLogger(config.logging.path);

        const botOptions = {
            polling: true,
            onlyFirstMatch: true,
            request: {
                timeout: config.telegram.polling_timeout * 1000 || 30000,
                agent: new (require('https').Agent)({
                    keepAlive: true,
                    maxSockets: 1,
                    rejectUnauthorized: false
                })
            }
        };

        const bot = new TelegramBot(config.telegram.token, botOptions);

        // Обработка сетевых ошибок
        bot.on('error', (error) => {
            logger.error(`Bot error: ${error.code || error.message}`);
        });

        setupCommands(bot, config, logger);
        initMonitoring(bot, config, logger);

    } catch (error) {
        console.error('Fatal startup error:', error);
        process.exit(1);
    }
}

startApp();