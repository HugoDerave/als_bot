require('dotenv').config()
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES]});
const axios = require("axios");
const http = require('http'); //Used to force axios in IPv4 for gateway purposes.

const Presence = require('./presence');
const Utils = require('./utils');
const CommandsDeploy = require('./deploy-commands');

const agent = new http.Agent({ family: 4 });
axios.defaults.httpAgent = agent;

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

    try{
        switch(interaction.commandName){

            case "help":

                interaction.reply("You can find all available commands by typing ``/`` and clicking the ``ALS Bot`` logo in the left sidebar. We are only using slash commands :-)\n\nLearn more about the ALS Bot: https://apexlegendsstatus.com/discord")

                break;

            case "server-status":

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

                break;

            case 'map':

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

                break;

            case 'stats':

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

                break;

            default:
                return; //This should never happen, but who knows

        }
    } catch(e){

        console.log(e);
        await interaction.reply({embeds: [Utils.getErrorEmbed()]})

    }
});

client.login(process.env.DISCORD_TOKEN);