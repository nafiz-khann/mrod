const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info(`Bot is ready! Logged in as ${client.user.tag}`);
    client.user.setActivity('Moderating servers', { type: 'WATCHING' });
  },
};
