const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playerlist')
		.setDescription('Get List of Online Players')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction, exports) {
        let playerIds = getPlayers().sort();
        if (playerIds.length == 0) return interaction.reply({ content: "No players online :(" });
        
        const serverName = GetConvar("sv_projectName", "default FXServer");
        const maxPlayers = GetConvarInt('sv_maxclients', 48);
        const playerPerPage = 20;

        if (playerIds.length <= playerPerPage) {
            const embed = new EmbedBuilder()
                .setAuthor({name: `${serverName} Player List`, iconURL: interaction.guild.iconURL({ format: "png", size: 512 })})
                .setColor(0x00FFFF)
                .setTitle(`Players Online (${GetNumPlayerIndices()}/${maxPlayers})`)
                .setTimestamp()

            playerIds.forEach(async (serverId) => {
                const charData = exports[scriptName].getCharData(parseInt(serverId));
                if (charData) {
                    embed.addFields([{name: charData.name, value: `ID ${serverId} | ${charData.charName} | ${charData.jobLabel} | On Duty: ${charData.duty}`, inline: false}]);
                } else {
                    embed.addFields([{name: GetPlayerName(serverId), value: `ID ${serverId} | Character Not Loaded`, inline: false}]);
                }
            });
            return await interaction.reply({ embeds: [embed] });
        }

        const pages = [];
        let currentPage = 0;
        let numberOfPages = Math.ceil(playerIds.length/playerPerPage);

        const backButton = new ButtonBuilder()
            .setCustomId('playerPrevious')
            .setLabel("Back")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary);

        const forwardButton =  new ButtonBuilder()
            .setCustomId('playerNext')
            .setLabel("Next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(backButton.setDisabled(true)).addComponents(forwardButton);

        for (let i = 0; i < numberOfPages; i++) {
            const startIndex = i * playerPerPage
            const currentChunk = playerIds.slice(startIndex, startIndex + playerPerPage)
            const embed = new EmbedBuilder()
                .setAuthor({name: `${serverName} Player List`, iconURL: interaction.guild.iconURL({ format: "png", size: 512 })})
                .setColor(0x00FFFF)
                .setTitle(`Players Online (${GetNumPlayerIndices()}/${maxPlayers})`)
                .setFooter({ text: `Page ${i + 1}/${numberOfPages}`})
                .setTimestamp()

                currentChunk.forEach(async (serverId) => {
                    const charData = exports[scriptName].getCharData(parseInt(serverId));
                    if (charData) {
                        embed.addFields([{name: charData.name, value: `ID ${serverId} | ${charData.charName} | ${charData.jobLabel} | On Duty: ${charData.duty}`, inline: false}]);
                    } else {
                        embed.addFields([{name: GetPlayerName(serverId), value: `ID ${serverId} | Character Not Loaded`, inline: false}]);
                    }
                })

            pages.push(embed)
        }

        const message = await interaction.reply({ embeds: [pages[0]], components: [row] });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });
        
        collector.on('collect', async (i) => {
            if (i.user.id === interaction.user.id) {
                if (i.customId == "playerPrevious") {
                    currentPage--;

                    if (currentPage == 0) {
                        const row = new ActionRowBuilder().addComponents(backButton.setDisabled(true)).addComponents(forwardButton.setDisabled(false));
                        i.update({embeds: [pages[currentPage]], components: [row]});
                    } else {
                        const row = new ActionRowBuilder().addComponents(backButton.setDisabled(false)).addComponents(forwardButton.setDisabled(false));
                        i.update({embeds: [pages[currentPage]], components: [row]});
                    }

                } else if (i.customId == "playerNext") {
                    currentPage++;

                    if (currentPage == pages.length - 1) {
                        const row = new ActionRowBuilder().addComponents(backButton.setDisabled(false)).addComponents(forwardButton.setDisabled(true));
                        i.update({embeds: [pages[currentPage]], components: [row]});
                    } else {
                        const row = new ActionRowBuilder().addComponents(backButton.setDisabled(false)).addComponents(forwardButton.setDisabled(false));
                        i.update({embeds: [pages[currentPage]], components: [row]});
                    }
                }
            } else {
                i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
            }
        });
        
        collector.on('end', () => {
            row.components.forEach(item => {
                item.setDisabled(true);
            })
            interaction.editReply({content: "Buttons timed out, re-run command to continue", embeds: [pages[currentPage]], components: [row]});
        });

	},
};