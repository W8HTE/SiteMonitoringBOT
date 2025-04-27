class Notifier {
    constructor(bot, chatId, logger) {
        this.bot = bot;
        this.chatId = chatId;
        this.logger = logger;
    }

    formatStatusMessage(url, status, prevStatus) {
        const time = new Date().toLocaleString();
        const statusText = status.available ? 'Доступен' : 'Недоступен';
        const emoji = status.available ? '✅' : '⚠️';

        let message = `${emoji} [${time}] Сайт ${url}\n` +
            `Статус: ${statusText}\n` +
            `Код: ${status.status || 'N/A'}\n` +
            `Время ответа: ${status.responseTime}мс`;

        if (status.available && prevStatus && !prevStatus.available) {
            message = `✅ [${time}] Сайт ${url} восстановлен!\n` +
                `Код: ${status.status}, Время ответа: ${status.responseTime}мс`;
        }

        if (!status.available && status.error) {
            message += `\nОшибка: ${status.error}`;
        }

        return message;
    }


    async sendStatusChange(url, currentStatus, prevStatus) {
        const message = this.formatStatusMessage(url, currentStatus, prevStatus);

        try {
            await this.bot.sendMessage(this.chatId, message);
            this.logger.info(`Notification sent for ${url}`);
        } catch (error) {
            this.logger.error(`Failed to send notification: ${error.message}`);
        }
    }



    async sendReport(report) {
        try {
            await this.bot.sendMessage(this.chatId, report, { parse_mode: 'Markdown' });
        } catch (error) {
            this.logger.error(`Failed to send report: ${error.message}`);
        }
    }
}

module.exports = { Notifier };