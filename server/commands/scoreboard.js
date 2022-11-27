module.exports = {
	data: new SlashCommandBuilder()
		.setName('scoreboard')
		.setDescription('Get Server Scoreboard')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction, exports) {
		const scoreboardData = await exports[scriptName].discordScoreboard();
		const embed = new EmbedBuilder()
			.setAuthor({name: scoreboardData.serverName, iconURL: interaction.guild.iconURL({ format: "png", size: 512 })})
			.setColor(0x00FFFF)
			.setTitle("Server Scoreboard")
			.addFields(
				{name: "Players Online", value: `\`\`\`${scoreboardData.onlinePlayers}/${scoreboardData.maxPlayers}\`\`\``, inline: true},
				{name: "Admins Online", value: `\`\`\`${scoreboardData.adminCount}\`\`\``, inline: true},
			)
			.setTimestamp()

		for (const job in scoreboardData.jobCount) {
			if (scoreboardData.jobCount[job].checkDuty) {
				embed.addFields([{name: `${scoreboardData.jobCount[job].label} On Duty`, value: `\`\`\`${scoreboardData.jobCount[job].count.toString()}\`\`\``, inline: false}]);
			} else {
				embed.addFields([{name: `${scoreboardData.jobCount[job].label} Online`, value: `\`\`\`${scoreboardData.jobCount[job].count.toString()}\`\`\``, inline: false}]);				
			}
		}

		interaction.reply({ embeds: [embed]})
	},
};