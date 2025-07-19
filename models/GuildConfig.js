const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: ',,' }, // Default prefix
  logChannelId: { type: String },
  welcomeChannelId: { type: String },
  welcomeMessage: { type: String },
  leaveMessage: { type: String },
  autoRoles: [{ type: String }],
  antiSpamEnabled: { type: Boolean, default: false },
  antiLinkEnabled: { type: Boolean, default: false },
  linkWhitelist: [{ type: String }],
  aiModerationEnabled: { type: Boolean, default: false },
  afkEnabled: { type: Boolean, default: false },
  warnThreshold: { type: Number, default: 3 },
  autoPunishAction: { type: String, enum: ['MUTE', 'KICK', 'BAN'], default: 'MUTE' },
  captchaEnabled: { type: Boolean, default: false },
  minAccountAge: { type: Number, default: 0 }, // In days
  language: { type: String, default: 'en' }, // For multi-language support
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
