const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({ partials: [Partials.GuildMember], intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const fetch = require('node-fetch')

global.config = require("./config.json")

function discordIdError(result) {
    if (result == "error") {
        console.log("Discord Bot Error. Discord Server ID does not match in resource glow_admin_sb");
    }
}

client.on("ready", () => {
   console.log(`Admin Bot: Logged in as ${client.user.tag}!`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const response = await fetch(`http://${config.serverIP}/glow_admin_sb/updateMemberRoles`, {method: 'POST', body: JSON.stringify(newMember)});
    const data = await response.json();
    discordIdError(data.result);
});

client.on('roleCreate', async (role) => {
    const roleChange = {
        action: "create",
        role: role
    }
    const response = await fetch(`http://${config.serverIP}/glow_admin_sb/updateRoles`, {method: 'POST', body: JSON.stringify(roleChange)});
    const data = await response.json();
    discordIdError(data.result);
})
client.on('roleDelete', async (role) => {
    const roleChange = {
        action: "delete",
        role: role
    }
    const response = await fetch(`http://${config.serverIP}/glow_admin_sb/updateRoles`, {method: 'POST', body: JSON.stringify(roleChange)});
    const data = await response.json();
    discordIdError(data.result);
})
client.on('roleUpdate', async (oldRole, newRole) => {
    const roleChange = {
        action: "update",
        role: newRole
    }
    const response = await fetch(`http://${config.serverIP}/glow_admin_sb/updateRoles`, {method: 'POST', body: JSON.stringify(roleChange)});
    const data = await response.json();
    discordIdError(data.result);
})

client.login(config.discordBotToken);