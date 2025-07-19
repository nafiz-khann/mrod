async function loadGuilds() {
  const response = await fetch('/api/guilds');
  const guilds = await response.json();
  const guildsDiv = document.getElementById('guilds');
  guildsDiv.innerHTML = guilds
    .map(g => `<button onclick="loadConfig('${g.id}')">${g.name}</button>`)
    .join('');
}

async function loadConfig(guildId) {
  const response = await fetch(`/api/guild/${guildId}/config`);
  const config = await response.json();
  const configDiv = document.getElementById('config');
  configDiv.innerHTML = `
    <h2>Configuration for Guild ${guildId}</h2>
    <label>Prefix: <input id="prefix" value="${config.prefix || ',,'}"></label><br>
    <label>Log Channel ID: <input id="logChannelId" value="${config.logChannelId || ''}"></label><br>
    <button onclick="saveConfig('${guildId}')">Save</button>
  `;
}

async function saveConfig(guildId) {
  const config = {
    prefix: document.getElementById('prefix').value,
    logChannelId: document.getElementById('logChannelId').value,
  };
  await fetch(`/api/guild/${guildId}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  alert('Configuration saved!');
}

loadGuilds();
