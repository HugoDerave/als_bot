require('dotenv').config()
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES]});

const Presence = require('./classes/presence');
const Utils = require('./classes/utils');
const CommandsDeploy = require('./classes/deploy-commands');

//Start the bot
client.on('ready', () => {
    console.log("Starting bot init");

    //Load commands
    CommandsDeploy.deployCommands(client);

    console.log(`Logged in as ${client.user.tag}!`);

    // Load bot presence updater
    new Presence(client);

    console.log("Bot init done!");
});


//Used when a slash command is sent by a user
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName)
	if (!command) return;
    try{

		command.execute(interaction)

    } catch(e){

        console.log(e);
        await interaction.reply({embeds: [Utils.getErrorEmbed()]})

    }
});

client.login(process.env.DISCORD_TOKEN);

