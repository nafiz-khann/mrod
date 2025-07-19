require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const logger = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.afk = new Collection(); // For AFK system

// Load Commands
async function loadCommands() {
  const categories = await fs.readdir(path.join(__dirname, 'commands'));
  const commandsToRegister = [];

  for (const category of categories) {
    const commandFiles = await fs.readdir(path.join(__dirname, 'commands', category));
    for (const file of commandFiles) {
      if (file.endsWith('.js')) {
        const command = require(path.join(__dirname, 'commands', category, file));
        client.commands.set(command.data.name, command);
        commandsToRegister.push(command.data.toJSON());
      }
    }
  }

  // Register Slash Commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
      body: commandsToRegister,
    });
    logger.info(`Registered ${commandsToRegister.length} slash commands`);
  } catch (error) {
    logger.error('Error registering slash commands:', error);
  }

  logger.info(`Loaded ${client.commands.size} commands`);
}

// Load Events
async function loadEvents() {
  const eventFiles = await fs.readdir(path.join(__dirname, 'events'));
  for (const file of eventFiles) {
    if (file.endsWith('.js')) {
      const event = require(path.join(__dirname, 'events', file));
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  }
  logger.info(`Loaded ${eventFiles.length} events`);
}

// Initialize Bot
async function startBot() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to MongoDB');

    await loadCommands();
    await loadEvents();

    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Bot logged in successfully');
  } catch (error) {
    logger.error('Startup error:', error);
    process.exit(1);
  }
}

// Start Web Dashboard
const app = express();
require('./web/server')(app, client);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Web dashboard running on port ${port}`);
});

startBot();
