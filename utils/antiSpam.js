const { Collection } = require('discord.js');

const messageCache = new Collection();
const THRESHOLD = 5; // Messages in time window
const TIME_WINDOW = 5000; // 5 seconds

module.exports = {
  async check(message, client) {
    const userId = message.author.id;
    if (!messageCache.has(userId)) {
      messageCache.set(userId, []);
    }

    const messages = messageCache.get(userId);
    messages.push(Date.now());

    // Clean up old messages
    messageCache.set(
      userId,
      messages.filter(timestamp => Date.now() - timestamp < TIME_WINDOW)
    );

    if (messages.length > THRESHOLD) {
      return true; // Spam detected
    }

    return false;
  },
};
