const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const { GuildConfig } = require('../models');
const logger = require('../utils/logger');

module.exports = (app, client) => {
  app.use(express.json());
  app.use(express.static('web/public'));
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: ['identify', 'guilds'],
      },
      async (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  app.get('/auth/discord', passport.authenticate('discord'));
  app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard')
  );

  app.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/auth/discord');
    const guilds = req.user.guilds.filter(g => g.permissions & 0x8); // Admin permissions
    res.sendFile('index.html', { root: './web/public' });
  });

  app.get('/api/guilds', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const guilds = req.user.guilds.filter(g => g.permissions & 0x8);
    res.json(guilds);
  });

  app.get('/api/guild/:id/config', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const config = await GuildConfig.findOne({ guildId: req.params.id });
      res.json(config || {});
    } catch (error) {
      logger.error('Error fetching guild config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/guild/:id/config', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const config = await GuildConfig.findOneAndUpdate(
        { guildId: req.params.id },
        req.body,
        { new: true, upsert: true }
      );
      res.json(config);
    } catch (error) {
      logger.error('Error updating guild config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
