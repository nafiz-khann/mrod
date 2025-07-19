# Ultimate Discord Moderation Bot

A professional, feature-rich Discord moderation bot built with Node.js, discord.js v14, and MongoDB, hosted on Replit.

## Features
- **Core Moderation**: Ban, kick, mute, timeout, unmute, unban, softban, tempban, warnings, purge
- **Security**: Anti-link, anti-spam, anti-raid, anti-nuke, account age verification
- **Logging**: Audit logs for all actions, image/file logging
- **AI Features**: Toxicity detection (placeholder for external API)
- **Utilities**: Auto-role, welcome/leave messages, message purge
- **Verification**: Captcha, two-step role verification
- **Tickets**: Button-based ticket system with auto-close
- **Web Dashboard**: Configure settings via a responsive UI
- **Extras**: AFK system, slowmode, mass role management, polls, reaction roles, multi-language
- **Commands**: Supports both slash (`/`) and prefix (default `,,`) commands

## Prerequisites
- Node.js 18+
- MongoDB (e.g., MongoDB Atlas)
- Discord Bot Token
- Discord OAuth2 Credentials
- Replit account

## Setup on Replit
1. **Create a Replit Project**:
   - Go to [replit.com](https://replit.com) and create a new Node.js repl.
   - Upload all project files or clone from a GitHub repository.

2. **Install Dependencies**:
   - Run in the Replit shell:
     ```bash
     npm install
     ```

3. **Configure Environment Variables**:
   - In Replit, go to the "Secrets" tab and add:
     - `DISCORD_TOKEN`: Your bot token
     - `DISCORD_CLIENT_ID`: Your application client ID
     - `DISCORD_CLIENT_SECRET`: Your application client secret
     - `DISCORD_CALLBACK_URL`: `https://your-replit-app.replit.app/auth/discord/callback`
     - `MONGODB_URI`: Your MongoDB connection string
     - `SESSION_SECRET`: A random string (e.g., generate with a password manager)
     - `PORT`: `3000`

4. **Run the Bot**:
   - Click the "Run" button in Replit, or run:
     ```bash
     npm start
     ```
   - The bot should log in, and the web dashboard will be available at `https://your-replit-app.replit.app`.

5. **Invite the Bot**:
   - In the Discord Developer Portal, generate an OAuth2 URL with the `bot` scope and Administrator permissions.
   - Invite the bot to your server.

## Usage
- **Slash Commands**: Use `/ban`, `/prefix`, `/ticket`, etc.
- **Prefix Commands**: Use `,,ban`, `,,prefix`, etc. Change the prefix with `/prefix !` or `,,prefix !`.
- **Web Dashboard**: Access at `https://your-replit-app.replit.app` to configure settings.
- **AI Moderation**: Integrate with Perspective API for toxicity detection (update `aiModeration.js`).

## Contributing
Submit issues or pull requests to the repository.

## License
MIT
