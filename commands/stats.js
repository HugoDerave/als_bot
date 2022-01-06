const { SlashCommandBuilder, SlashCommandStringOption} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const axios = require("axios");
const http = require('http'); //Used to force axios in IPv4 for gateway purposes.
const Utils = require('../classes/utils');

const agent = new http.Agent({ family: 4 });
axios.defaults.httpAgent = agent;

//TODO: Dynamic legends from gateway
let legends = ["Octane", "Wraith", "Bloodhound", "Pathfinder", "Lifeline", "Valkyrie", "Bangalore", "Caustic", "Horizon", "Loba", "Fuse", "Gibraltar", "Seer", "Mirage", "Revenant", "Rampart", "Wattson", "Crypto"];
legends.sort();
let legendsChoicesConstructor = new SlashCommandStringOption();

legendsChoicesConstructor.setName('legend').setDescription("Select the legend for which you want to see statistics")

legends.forEach((leg) => {
	legendsChoicesConstructor.addChoice(leg, leg);
});

module.exports = {
	data: new SlashCommandBuilder().setName('stats').setDescription('Get a player statistics')
                .addStringOption(option => option.setName('platform').setDescription("Searched player platform").addChoice("PC (Origin)", "PC").addChoice("Playstation", "PS4").addChoice("Xbox", "X1").setRequired(true))
                .addStringOption(option => option.setName('player_name').setDescription("Searched player name").setRequired(true))
                .addStringOption(legendsChoicesConstructor),
	async execute(interaction) {

		await interaction.reply({ embeds: [Utils.getLoadingEmbed()]});

		let statsUsername = interaction.options.getString('player_name');
		let statsPlatform = interaction.options.getString('platform');
		let statsLegend = interaction.options.getString('legend');

		let globalStatsAPI = await axios.get("https://lil2-gateway.apexlegendsstatus.com/gateway.php?qt=stats-single-legend&userName=" + statsUsername + "&userPlatform=" + statsPlatform + "&userLegend=" + statsLegend).then(response => response.data);

		if (globalStatsAPI['statsAPI'].hasOwnProperty('Error')) {

			const statsEmbed = new MessageEmbed()
				.setColor('#930000')
				.setTitle("Player not found")
				.setDescription("<:serverdown:687048354571616327> Sorry, we couldn't find this player. Please try again!\nIf you're looking for a Steam user, make sure you're using the Origin account name linked to this Steam account. If this keeps happening, feel free to ask @_apexstatus on Twitter!")

			await interaction.editReply({embeds: [statsEmbed]});

		} else {

			let playerStatus;
			if (globalStatsAPI['statsAPI']['realtime']['currentState'] === "offline") {
				playerStatus = ':red_circle: Offline or unknown status';
			} else if (globalStatsAPI['statsAPI']['realtime']['currentState'] === "inLobby") {
				playerStatus = ':green_circle: In lobby <t:' + globalStatsAPI['statsAPI']['realtime']['currentStateSinceTimestamp'] + ':R>, currently playing ' + globalStatsAPI['statsAPI']['realtime']['selectedLegend'];
			} else if (globalStatsAPI['statsAPI']['realtime']['currentState'] === "inMatch") {
				playerStatus = ':orange_circle: In game <t:' + globalStatsAPI['statsAPI']['realtime']['currentStateSinceTimestamp'] + ':R>, currently playing ' + globalStatsAPI['statsAPI']['realtime']['selectedLegend'];
			} else {
				playerStatus = ':white_circle: Unknown status';
			}

			const statsEmbed = new MessageEmbed()
				.setColor('#930000')
				.setTitle(Utils.getPlatformEmoji(globalStatsAPI['statsAPI']['global']['platform']) + " " + globalStatsAPI['statsAPI']['global']['name'] + "'s statistics")
				.setThumbnail(globalStatsAPI['statsAPI']['global']['avatar'])
				.setDescription(playerStatus)
				.setURL("https://apexlegendsstatus.com/profile/uid/" + globalStatsAPI['statsAPI']['global']['platform'] + "/" + globalStatsAPI['statsAPI']['global']['uid'])
				.setFooter("Incorrect data? Select the trackers in-game and try again. To update your BP level, select the BP badge in game.\nWant to see more stats? Click on \""+globalStatsAPI['statsAPI']['global']['name'] + "'s statistics\" at the top of this message")
				.setImage(globalStatsAPI['bannerPath']);

			statsEmbed.addField(":gear: General", "Level **" + globalStatsAPI['statsAPI']['global']['level'] + "** (" + globalStatsAPI['statsAPI']['global']['toNextLevelPercent']+"%)\nBP level **" + globalStatsAPI['statsAPI']['global']['battlepass']['level'] + "**", true)

			let BR_rank = globalStatsAPI['statsAPI']['global']['rank']['rankName'];
			let BR_div = globalStatsAPI['statsAPI']['global']['rank']['rankDiv'];
			let Arenas_rank = globalStatsAPI['statsAPI']['global']['arena']['rankName'];
			let Arenas_div = globalStatsAPI['statsAPI']['global']['arena']['rankDiv'];

			statsEmbed.addField(":crown: Ranked", "**BR** <:"+BR_rank.toLowerCase().replaceAll(" ", "")+BR_div+":"+Utils.getRankEmoji(client, BR_rank, BR_div)+"> "+BR_rank+" "+BR_div+", "+globalStatsAPI['statsAPI']['global']['rank']['rankScore']+" RP"
				+"\n**Arena** <:"+Arenas_rank.toLowerCase().replaceAll(" ", "")+Arenas_div+":"+Utils.getRankEmoji(client, Arenas_rank, Arenas_div)+"> "+Arenas_rank+" "+Arenas_div+", "+globalStatsAPI['statsAPI']['global']['arena']['rankScore']+" AP", true)

			let dispLegend;
			if(statsLegend === null){
				dispLegend = globalStatsAPI['statsAPI']['realtime']['selectedLegend'];
			}else{
				dispLegend = statsLegend;
			}

			statsEmbed.addField('\u200B', 'Find your '+ dispLegend + '\'s statistics below :arrow_down:');

			await interaction.editReply({embeds: [statsEmbed]});
		}

	}
}
