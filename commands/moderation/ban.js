const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig, Warning } = require('../../models');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server')
    .addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  permissions: PermissionFlagsBits.BanMembers,

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) return interaction.editReply('User not found in the server.');
      if (!member.bannable) return interaction.editReply('I cannot ban this user.');

      await member.ban({ reason });
      await Warning.create({
        userId: user.id,
        guildId: interaction.guild.id,
        reason,
        moderatorId: interaction.user.id,
        type: 'BAN',
      });

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (config?.logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: 'User Banned',
              description: `**User**: ${user.tag}\n**Reason**: ${reason}\n**Moderator**: ${interaction.user.tag}`,
              color: 0xff0000,
              timestamp: new Date(),
            }],
          });
        }
      }

      await interaction.editReply(`Successfully banned ${user.tag}.`);
      logger.info(`User ${user.tag} banned by ${interaction.user.tag} in ${interaction.guild.name}`);
    } catch (error) {
      logger.error('Ban command error:', error);
      await interaction.editReply('An error occurred while banning the user.');
    }
  },

  async run(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 1) {
      return message.reply('Please provide a user to ban (mention or ID).');
    }

    try {
      const userId = args[0].replace(/[<@!>]|\D/g, '');
      const reason = args.slice(1).join(' ') || 'No reason provided';
      const member = await message.guild.members.fetch(userId).catch(() => null);

      if (!member) return message.reply('User not found in the server.');
      if (!member.bannable) return message.reply('I cannot ban this user.');

      await member.ban({ reason });
      await Warning.create({
        userId: member.user.id,
        guildId: message.guild.id,
        reason,
        moderatorId: message.author.id,
        type: 'BAN',
      });

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (config?.logChannelId) {
        const logChannel = message.guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: 'User Banned',
              description: `**User**: ${member.user.tag}\n**Reason**: ${reason}\n**Moderator**: ${message.author.tag}`,
              color: 0xff0000,
              timestamp: new Date(),
            }],
          });
        }
      }

      await message.reply(`Successfully banned ${member.user.tag}.`);
      logger.info(`User ${member.user.tag} banned by ${message.author.tag} in ${message.guild.name}`);
    } catch (error) {
      logger.error('Ban prefix command error:', error);
      await message.reply('An error occurred while banning the user.');
    }
  },
};
