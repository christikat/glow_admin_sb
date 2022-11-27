const { Client, Collection, Events, GatewayIntentBits, Partials, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const client = new Client({ partials: [Partials.GuildMember], intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const scriptName = GetCurrentResourceName();

global.config = require("./config.json");
client.commands = new Collection();

async function registerCommands() {
    const { REST, Routes } = require('discord.js');
    const fs = require('node:fs');
    const path = require('node:path');
    const commands = [];
    const commandsPath = path.join(GetResourcePath(GetCurrentResourceName()), '/server/commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
    const rest = new REST({ version: '10' }).setToken(config.discordBotToken);
    
    rest.put(
        Routes.applicationGuildCommands(config.applicationId, config.discordServerId),
        { body: {} }
    );

    await rest.put(
        Routes.applicationCommands(config.applicationId),
        { body: commands },
    );
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, exports);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on("ready", () => {
    registerCommands();
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