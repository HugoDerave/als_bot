const { SlashCommandBuilder, SlashCommandStringOption} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const axios = require("axios");
const http = require('http'); //Used to force axios in IPv4 for gateway purposes.
const Utils = require('../classes/utils');

const agent = new http.Agent({ family: 4 });
axios.defaults.httpAgent = agent;

module.exports = {
	data: new SlashCommandBuilder().setName('map').setDescription('Get the current map in rotation in Arenas and Battle Royale'),
	async execute(interaction) {

		await interaction.reply({ embeds: [Utils.getLoadingEmbed()]});

		let mapResp = await axios.get("https://lil2-gateway.apexlegendsstatus.com/gateway.php?qt=map").then(response => response.data);

		const mapEmbed = new MessageEmbed()
			.setColor('#930000')
			.setTitle("Current Apex Legends map")
			.setDescription(":map: **Battle Royale**\nCurrent **pubs** map is **"
				+ mapResp["rotation"]["battle_royale"]["current"]["map"]
				+ "**, ends <t:"
				+ mapResp["rotation"]["battle_royale"]["current"]["end"]
				+ ":R>. Next map is **"
				+ mapResp["rotation"]["battle_royale"]["next"]["map"]
				+ "** and will end <t:"
				+ mapResp["rotation"]["battle_royale"]["next"]["end"]
				+ ":R> (up for " + mapResp["rotation"]["battle_royale"]["next"]["DurationInMinutes"] + "mins).\nCurrent **ranked** map is **"
				+ mapResp["rotation"]["ranked"]["current"]["map"]
				+ "**.\n\n:map: **Arenas**\n"
				+ "Current **pubs** map is **"
				+ mapResp["rotation"]["arenas"]["current"]["map"]
				+ "**, ends <t:"
				+ mapResp["rotation"]["arenas"]["current"]["end"]
				+ ":R>. Next map is **"
				+ mapResp["rotation"]["arenas"]["next"]["map"]
				+ "** and will end <t:"
				+ mapResp["rotation"]["arenas"]["next"]["end"]
				+ ":R> (up for " + mapResp["rotation"]["arenas"]["next"]["DurationInMinutes"] + "mins).\nCurrent **ranked** map is **"
				+ mapResp["rotation"]["arenasRanked"]["current"]["map"]
				+ "**, ends <t:"
				+ mapResp["rotation"]["arenasRanked"]["current"]["end"]
				+ ":R>. Next map is **"
				+ mapResp["rotation"]["arenasRanked"]["next"]["map"]
				+ "** and will end <t:"
				+ mapResp["rotation"]["arenasRanked"]["next"]["end"]
				+ ":R> (up for " + mapResp["rotation"]["arenasRanked"]["next"]["DurationInMinutes"] + "mins). ")
			.setImage(mapResp['bannerPath']);

		await interaction.editReply({ embeds: [mapEmbed] });

	}
}
