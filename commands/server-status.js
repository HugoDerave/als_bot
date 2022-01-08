const { SlashCommandBuilder, SlashCommandStringOption} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const axios = require("axios");
const http = require('http'); //Used to force axios in IPv4 for gateway purposes.
const Utils = require('../classes/utils');

const agent = new http.Agent({ family: 4 });
axios.defaults.httpAgent = agent;

module.exports = {
	data:  new SlashCommandBuilder().setName('server-status').setDescription('Get current Apex Legends\' servers status')
                .addBooleanOption(option => option.setName('announcement_only')
                    .setDescription("Only show the latest announcement from the ALS website")),
	async execute(interaction) {

		await interaction.reply({ embeds: [Utils.getLoadingEmbed()]});

			let resp  = await axios.get("https://lil2-gateway.apexlegendsstatus.com/gateway.php?qt=server-status-full").then(response => response.data);
			let annoContent;

			//Check if anno is still in effect
			if(resp['anno']['Release'] + resp['anno']['Duration'] <= Math.floor(Date.now() / 1000)){
				annoContent = "No announcements at this time! <:serverup:687048354693251114>";
			}else{
				annoContent = "<:unstable:897222588126875728> " + resp['anno']['Content'];
			}

			const embed = new MessageEmbed()
				.setColor('#EFFF00')
				.setTitle("Current Apex Legends server status")
				.setDescription(annoContent)
				.setThumbnail('https://apexlegendsstatus.com/discord_icon.png')
				.setFooter('More data & Report your issues on apexlegendsstatus.com');

			if(!interaction.options.getBoolean('announcement_only')) {
				let inlineCounter = 0;

				//Loop through all legacy servers
				Object.keys(resp['legacyServers']).forEach((key) => {

					let constructor = [];

					Object.keys(resp['legacyServers'][key]).forEach((region) => {

						let value = resp['legacyServers'][key][region];
						constructor.push(Utils.getEmoji(value['Status']) + " " + Utils.getLegacyFlag(region) + " " + Utils.getLegacyName(region));

					});

					embed.addField(Utils.getServerReadableName(key), constructor.join("\n"), true);

					if (inlineCounter % 2 !== 0) {
						embed.addField('\u200b', '\u200b', true)
					}
					inlineCounter++;
				});

				//Loop through all mm Servers and only keep the essential infos
				let constructor = [];

				Object.keys(resp['mmServers']).forEach((region) => {

					let value = resp['mmServers'][region];
					let tmpStatus;

					if (value['upAvailPercent'] < 75) {
						tmpStatus = "DOWN";
					} else if (value['upAvailPercent'] < 100) {
						tmpStatus = "UNSTABLE";
					} else {
						tmpStatus = "UP";
					}

					constructor.push(Utils.getEmoji(tmpStatus) + " " + Utils.getDCFlag(region) + " " + Utils.getDCName(region));

				});

				embed.addField("MM/Lobby servers", constructor.join("\n"), true);

			}

			await interaction.editReply({ embeds: [embed] });

	}

}

