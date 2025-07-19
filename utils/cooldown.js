const { Collection } = require('discord.js');

module.exports = {
  check: (interactionOrMessage, commandName, cooldownTime = 5000) => {
    const client = interactionOrMessage.client;
    const userId = interactionOrMessage.user?.id || interactionOrMessage.author.id;
    if (!client.cooldowns.has(commandName)) client.cooldowns.set(commandName, new Collection());

    const timestamps = client.cooldowns.get(commandName);
    const now = Date.now();
    if (timestamps.has(userId)) {
      const expiration = timestamps.get(userId) + cooldownTime;
      if (now < expiration) return expiration - now;
    }
    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownTime);
    return 0;
  },
};
