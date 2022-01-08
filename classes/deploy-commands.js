require('dotenv').config()
const fs = require('fs')
const { SlashCommandBuilder, SlashCommandStringOption} = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js')
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

module.exports = {

    deployCommands : (client) => {

		commands = []
		client.commands = new Collection()

		for(const file of commandFiles) {
			const command = require(`../commands/${file}`)
			commandObj = command.data.toJSON()
			commands.push(commandObj)
			client.commands.set(commandObj.name, command)
		}

        const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN);

        if(process.env.ENV === "dev") {

            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID), {body: commands})
                .then(() => console.log('Successfully registered application commands.'))
                .catch(console.error);

        }else if(process.env.ENV === "prod"){

                rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: commands})
                    .then(() => console.log('Successfully registered application commands for Guild ' + guildValue.name + " (" + guildValue.id + ")"))
                    .catch(console.error);

        }
    }
}
