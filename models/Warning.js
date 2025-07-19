const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  reason: { type: String },
  moderatorId: { type: String, required: true },
  type: { type: String, enum: ['WARN', 'MUTE', 'KICK', 'BAN'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Warning', warningSchema);
