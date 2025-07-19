const { GuildConfig, UserHistory } = require('../models');
const { captcha } = require('../utils');
const logger = require('../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      const config = await GuildConfig.findOne({ guildId: member.guild.id });
      if (!config) return;

      // Account Age Verification
      if (config.minAccountAge) {
        const accountAge = (Date.now() - member.user.createdAt) / (1000 * 60 * 60 * 24);
        if (accountAge < config.minAccountAge) {
          await member.kick('Account too new');
          logger.info(`Kicked ${member.user.tag} for new account in ${member.guild.name}`);
          return;
        }
      }

      // Captcha Verification
      if (config.captchaEnabled) {
        const verified = await captcha.verify(member);
        if (!verified) {
          await member.kick('Failed captcha verification');
          logger.info(`Kicked ${member.user.tag} for failed captcha in ${member.guild.name}`);
          return;
        }
      }

      // Auto-Role
      if (config.autoRoles.length) {
        await member.roles.add(config.autoRoles);
      }

      // Welcome Message
      if (config.welcomeChannelId && config.welcomeMessage) {
        const channel = member.guild.channels.cache.get(config.welcomeChannelId);
        if (channel) {
          channel.send(config.welcomeMessage.replace('{user}', member.user.tag).replace('{guild}', member.guild.name));
        }
      }

      await UserHistory.create({
        userId: member.user.id,
        guildId: member.guild.id,
        action: 'JOIN',
      });
      logger.info(`${member.user.tag} joined ${member.guild.name}`);
    } catch (error) {
      logger.error('Guild member add error:', error);
    }
  },
};
