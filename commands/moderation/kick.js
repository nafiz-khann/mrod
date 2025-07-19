const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig, Warning } = require('../../models');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server')
    .addUserOption(option => option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  permissions: PermissionFlagsBits.KickMembers,

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) return interaction.editReply('User not found in the server.');
      if (!member.kickable) return interaction.editReply('I cannot kick this user.');

      await member.kick(reason);
      await Warning.create({
        userId: user.id,
        guildId: interaction.guild.id,
        reason,
        moderatorId: interaction.user.id,
        type: 'KICK',
      });

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (config?.logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: 'User Kicked',
              description: `**User**: ${user.tag}\n**Reason**: ${reason}\n**Moderator**: ${interaction.user.tag}`,
              color: 0xffa500,
              timestamp: new Date(),
            }],
          });
        }
      }

      await interaction.editReply(`Successfully kicked ${user.tag}.`);
      logger.info(`User ${user.tag} kicked by ${interaction.user.tag} in ${interaction.guild.name}`);
    } catch (error) {
      logger.error('Kick command error:', error);
      await interaction.editReply('An error occurred while kicking the user.');
    }
  },

  async run(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 1) {
      return message.reply('Please provide a user to kick (mention or ID).');
    }

    try {
      const userId = args[0].replace(/[<@!>]|\D/g, '');
      const reason = args.slice(1).join(' ') || 'No reason provided';
      const member = await message.guild.members.fetch(userId).catch(() => null);

      if (!member) return message.reply('User not found in the server.');
      if (!member.kickable) return message.reply('I cannot kick this user.');

      await member.kick(reason);
      await Warning.create({
        userId: member.user.id,
        guildId: message.guild.id,
        reason,
        moderatorId: message.author.id,
        type: 'KICK',
      });

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (config?.logChannelId) {
        const logChannel = message.guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: 'User Kicked',
              description: `**User**: ${member.user.tag}\n**Reason**: ${reason}\n**Moderator**: ${message.author.tag}`,
              color: 0xffa500,
              timestamp: new Date(),
            }],
          });
        }
      }

      await message.reply(`Successfully kicked ${member.user.tag}.`);
      logger.info(`User ${member.user.tag} kicked by ${message.author.tag} in ${message.guild.name}`);
    } catch (error) {
      logger.error('Kick prefix command error:', error);
      await message.reply('An error occurred while kicking the user.');
    }
  },
};
