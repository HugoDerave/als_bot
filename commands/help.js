const { SlashCommandBuilder, SlashCommandStringOption} = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
	data: new SlashCommandBuilder().setName('help').setDescription('Help and general infos'),
	async execute(interaction) {
		interaction.reply("You can find all available commands by typing ``/`` and clicking the ``ALS Bot`` logo in the left sidebar. We are only using slash     commands :-)\n\nLearn more about the ALS Bot: https://apexlegendsstatus.com/discord")
	}
}

