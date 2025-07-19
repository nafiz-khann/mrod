const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', ticketSchema);
