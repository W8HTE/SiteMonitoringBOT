const toml = require('@iarna/toml');
const fs = require('fs');
const path = require('path');


//и вот тута тоже надо
const DEFAULT_CONFIG = {
    telegram: {
        token: "Токен",
        chat_id: "чат айди"
    },
    monitoring: {
        interval: "*/5 * * * *",
        timeout: 10000,
        user_agent: "SiteMonitorBot/2.0",
        sites: [
            "https://google.com",
            "https://github.com"
        ]
    },
    logging: {
        path: "./logs/monitor.log",
        level: "info"
    }
};

async function loadConfig() {
    const configPath = path.join(__dirname, '../../config/default.toml');

    try {
        if (!fs.existsSync(configPath)) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
            fs.writeFileSync(configPath, toml.stringify(DEFAULT_CONFIG));
            console.warn('Config file created at', configPath);
            return DEFAULT_CONFIG;
        }

        const configFile = fs.readFileSync(configPath, 'utf-8');
        const userConfig = toml.parse(configFile);

        // Мердж с дефолтными значениями
        return {
            ...DEFAULT_CONFIG,
            ...userConfig,
            monitoring: {
                ...DEFAULT_CONFIG.monitoring,
                ...(userConfig.monitoring || {})
            }
        };
    } catch (error) {
        console.error('Error loading config:', error);
        return DEFAULT_CONFIG;
    }
}

module.exports = { loadConfig };