const { Notifier } = require('../monitoring/notifier');
const { SiteMonitor } = require('../monitoring/monitor');

function setupCommands(bot, config, logger) {
    const notifier = new Notifier(bot, config.telegram.chat_id, logger);
    const monitor = new SiteMonitor(bot, config, logger);

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, '🚀 Бот мониторинга сайтов активен!\nИспользуйте /status для проверки состояния');
    });

    bot.onText(/\/status/, async (msg) => {
        if (msg.chat.id.toString() !== config.telegram.chat_id) {
            return bot.sendMessage(msg.chat.id, '⛔ Доступ запрещен');
        }

        try {
            const results = await monitor.checkAllSites();
            let report = '📊 *Текущий статус сайтов*\n\n';

            results.forEach(({ url, available, status, responseTime }) => {
                const emoji = available ? '🟢' : '🔴';
                report += `${emoji} *${url}*\n` +
                    `Статус: ${available ? 'Доступен' : 'Недоступен'}\n` +
                    `Код: ${status || 'N/A'}\n` +
                    `Время: ${responseTime}мс\n\n`;
            });

            await notifier.sendReport(report);
        } catch (error) {
            logger.error(`Status command error: ${error.message}`);
            bot.sendMessage(msg.chat.id, '⚠️ Ошибка при получении статуса');
        }
    });

    bot.on('polling_error', (error) => {
        logger.error(`Polling error: ${error.code} - ${error.message}`);

        // Автоматический перезапуск при критических ошибках
        if (['ESOCKETTIMEDOUT', 'ECONNRESET'].includes(error.code)) {
            logger.warn('Attempting to restart polling...');
            setTimeout(() => bot.startPolling(), 5000);
        }
    });
}

module.exports = { setupCommands };