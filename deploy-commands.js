require('dotenv').config()
const { SlashCommandBuilder, SlashCommandStringOption} = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {

    deployCommands : (ctx) => {
        
        //TODO: Dynamic legends from gateway
        let legends = ["Octane", "Wraith", "Bloodhound", "Pathfinder", "Lifeline", "Valkyrie", "Bangalore", "Caustic", "Horizon", "Loba", "Fuse", "Gibraltar", "Seer", "Mirage", "Revenant", "Rampart", "Wattson", "Crypto"];
        legends.sort();
        let legendsChoicesConstructor = new SlashCommandStringOption();

        legendsChoicesConstructor.setName('legend').setDescription("Select the legend for which you want to see statistics")

        legends.forEach((leg) => {
            legendsChoicesConstructor.addChoice(leg, leg);
        });

        const commands = [
            new SlashCommandBuilder().setName('server-status').setDescription('Get current Apex Legends\' servers status')
                .addBooleanOption(option => option.setName('announcement_only')
                    .setDescription("Only show the latest announcement from the ALS website")),
            new SlashCommandBuilder().setName('help').setDescription('Help and general infos'),
            new SlashCommandBuilder().setName('map').setDescription('Get the current map in rotation in Arenas and Battle Royale'),
            new SlashCommandBuilder().setName('stats').setDescription('Get a player statistics')
                .addStringOption(option => option.setName('platform').setDescription("Searched player platform").addChoice("PC (Origin)", "PC").addChoice("Playstation", "PS4").addChoice("Xbox", "X1").setRequired(true))
                .addStringOption(option => option.setName('player_name').setDescription("Searched player name").setRequired(true))
                .addStringOption(legendsChoicesConstructor)
        ]
            .map(command => command.toJSON());

        const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN);

        if(process.env.ENV === "dev") {

            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID), {body: commands})
                .then(() => console.log('Successfully registered application commands.'))
                .catch(console.error);

        }else if(process.env.ENV === "prod"){

            for(let [guildID, guildValue] of ctx.guilds.cache.entries()){

                rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildValue.id), {body: commands})
                    .then(() => console.log('Successfully registered application commands for Guild ' + guildValue.name + " (" + guildValue.id + ")"))
                    .catch(console.error);

            }
        }
    }
}