const cron = require('node-cron');
const axios = require('axios');
const { Notifier } = require('./notifier');

class SiteMonitor {
    constructor(bot, config, logger) {
        this.bot = bot;
        this.config = config;
        this.logger = logger;
        this.statusHistory = new Map();
        this.notifier = new Notifier(bot, config.telegram.chat_id, logger);
    }

    async checkSite(url) {
        const startTime = Date.now();

        try {
            const response = await axios.get(url, {
                timeout: this.config.monitoring.timeout,
                headers: { 'User-Agent': this.config.monitoring.user_agent },
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                })
            });

            return {
                available: true,
                status: response.status,
                responseTime: Date.now() - startTime
            };
        } catch (error) {
            return {
                available: false,
                status: error.response?.status || 0,
                responseTime: Date.now() - startTime,
                error: error.code || error.message
            };
        }
    }

    async checkAllSites() {
        const results = [];

        for (const url of this.config.monitoring.sites) {
            try {
                const prevStatus = this.statusHistory.get(url);
                const currentStatus = await this.checkSite(url);

                // Логирование результата
                this.logger.info(`Checked ${url} - ${currentStatus.available ? 'OK' : 'FAIL'}`);

                // Отправка уведомления при изменении статуса
                if (!prevStatus || prevStatus.available !== currentStatus.available) {
                    await this.notifier.sendStatusChange(url, currentStatus, prevStatus);
                }

                this.statusHistory.set(url, currentStatus);
                results.push({ url, ...currentStatus });
            } catch (error) {
                this.logger.error(`Error checking ${url}: ${error.message}`);
                results.push({ url, error: error.message });
            }
        }

        return results;
    }

    startMonitoring() {
        this.logger.info(`Starting monitoring with interval: ${this.config.monitoring.interval}`);

        cron.schedule(this.config.monitoring.interval, async () => {
            this.logger.info('Running scheduled check...');
            await this.checkAllSites();
        });

        // Первая проверка при запуске
        this.checkAllSites();
    }
}

function initMonitoring(bot, config, logger) {
    const monitor = new SiteMonitor(bot, config, logger);
    monitor.startMonitoring();
}
//1 на 1 в миду на SF
module.exports = { initMonitoring, SiteMonitor };