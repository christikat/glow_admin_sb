const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({ partials: [Partials.GuildMember], intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const scriptName = GetCurrentResourceName();

global.config = require("./config.json")

client.on("ready", () => {
   console.log(`Admin Bot: Logged in as ${client.user.tag}!`);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
   exports[scriptName].updateMemberRoles(JSON.stringify(newMember));
});

client.on('roleCreate', async (role) => {
    const roleChange = {
        action: "create",
        role: role
    }    
    exports[scriptName].updateRoles(JSON.stringify(roleChange));
})

client.on('roleDelete', async (role) => {
    const roleChange = {
        action: "delete",
        role: role
    }
    exports[scriptName].updateRoles(JSON.stringify(roleChange));
})

client.on('roleUpdate', async (oldRole, newRole) => {
    const roleChange = {
        action: "update",
        role: newRole
    }
    exports[scriptName].updateRoles(JSON.stringify(roleChange));
})

client.login(config.discordBotToken);