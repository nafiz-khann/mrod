const { GuildConfig } = require('../models');
const { antiSpam, antiLink, aiModeration, cooldown } = require('../utils');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    try {
      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!config) return;

      // Prefix Command Handling
      const prefix = config.prefix || ',,';
      if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) return;

        // Check Cooldown
        const cooldownTime = cooldown.check(message, commandName, 5000);
        if (cooldownTime) {
          return message.reply(`Please wait ${cooldownTime / 1000} seconds before using this command again.`);
        }

        // Check Permissions
        if (command.permissions && !message.member.permissions.has(command.permissions)) {
          return message.reply('You do not have permission to use this command.');
        }

        // Execute Prefix Command
        try {
          await command.run(message, args, client);
          logger.info(`Prefix command ${commandName} executed by ${message.author.tag} in ${message.guild.name}`);
        } catch (error) {
          logger.error(`Error executing prefix command ${commandName}:`, error);
          await message.reply('An error occurred while executing the command.');
        }
        return;
      }

      // Anti-Spam
      if (config.antiSpamEnabled) {
        const isSpam = await antiSpam.check(message, client);
        if (isSpam) {
          await message.delete();
          await message.member.timeout(5 * 60 * 1000, 'Spam detected');
          logger.info(`Spam detected from ${message.author.tag} in ${message.guild.name}`);
          return;
        }
      }

      // Anti-Link
      if (config.antiLinkEnabled && !config.linkWhitelist.some(link => message.content.includes(link))) {
        const hasLink = await antiLink.check(message);
        if (hasLink) {
          await message.delete();
          await message.channel.send(`${message.author}, links are not allowed here.`);
          logger.info(`Link detected from ${message.author.tag} in ${message.guild.name}`);
          return;
        }
      }

      // AI Moderation
      if (config.aiModerationEnabled) {
        const isToxic = await aiModeration.analyze(message.content);
        if (isToxic) {
          await message.delete();
          await message.channel.send(`${message.author}, your message was flagged as inappropriate.`);
          logger.info(`Toxic message detected from ${message.author.tag} in ${message.guild.name}`);
        }
      }

      // AFK System
      if (config.afkEnabled) {
        const afkUser = client.afk.get(message.author.id);
        if (afkUser) {
          await client.afk.delete(message.author.id);
          await message.reply('Welcome back! Your AFK status has been removed.');
        }
        const mentioned = message.mentions.users.first();
        if (mentioned) {
          const afkData = client.afk.get(mentioned.id);
          if (afkData) {
            await message.reply(`${mentioned.tag} is AFK: ${afkData.reason}`);
          }
        }
      }
    } catch (error) {
      logger.error('Message create event error:', error);
    }
  },
};
