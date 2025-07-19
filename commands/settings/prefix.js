const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Change the bot prefix for this server')
    .addStringOption(option => option.setName('new_prefix').setDescription('New prefix').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  permissions: PermissionFlagsBits.ManageGuild,

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const newPrefix = interaction.options.getString('new_prefix');
      if (newPrefix.length > 5) {
        return interaction.editReply('Prefix must be 5 characters or less.');
      }

      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { prefix: newPrefix },
        { upsert: true }
      );

      await interaction.editReply(`Prefix changed to \`${newPrefix}\`.`);
      logger.info(`Prefix changed to ${newPrefix} by ${interaction.user.tag} in ${interaction.guild.name}`);
    } catch (error) {
      logger.error('Prefix command error:', error);
      await interaction.editReply('An error occurred while changing the prefix.');
    }
  },

  async run(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 1) {
      return message.reply('Please provide a new prefix.');
    }

    try {
      const newPrefix = args[0];
      if (newPrefix.length > 5) {
        return message.reply('Prefix must be 5 characters or less.');
      }

      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { prefix: newPrefix },
        { upsert: true }
      );

      await message.reply(`Prefix changed to \`${newPrefix}\`.`);
      logger.info(`Prefix changed to ${newPrefix} by ${message.author.tag} in ${message.guild.name}`);
    } catch (error) {
      logger.error('Prefix command error:', error);
      await message.reply('An error occurred while changing the prefix.');
    }
  },
};
