const {MessageEmbed} = require("discord.js");
module.exports = {

    getEmoji : (status) => {
        let emoji;

        switch(status){
            case 'UP':
                emoji = "<:serverup:687048354693251114>";
                break;
            case 'SLOW':
                emoji = "<:unstable:897222588126875728>";
                break;
            case 'UNSTABLE':
                emoji = "<:unstable:897222588126875728>";
                break;
            case 'DOWN':
                emoji = "<:serverdown:687048354571616327>";
                break;
        }
        return emoji;
    },

    getLegacyFlag : (region) => {
        let flag;

        switch(region){
            case 'EU-East':
            case 'EU-West':
                flag = ':flag_eu:';
                break;
            case 'US-Central':
            case 'US-West':
            case 'US-East':
                flag = ':flag_us:';
                break;
            case 'Asia':
                flag = ':flag_jp:';
                break;
            case 'SouthAmerica':
                flag = ':flag_br:';
                break;
            default:
                flag = "";
                break;
        }
        return flag;
    },

    getServerReadableName : (name) => {
        switch (name){
            case 'selfCoreTest':
                return 'Our services';
            case 'otherPlatforms':
                return 'Other platforms';
            default:
                return name.replace("_", " ");
        }
    },

    getDCFlag : (region) => {
        let flag;

        switch(region){
            case 'west+europe':
            case 'east+europe':
                flag = ':flag_eu:';
                break;
            case 'east+us':
            case 'central+us':
            case 'west+us':
                flag = ':flag_us:';
                break;
            case 'southeast+asia':
                flag = ':flag_jp:';
                break;
            case 'brazil+south':
                flag = ':flag_br:';
                break;
            default:
                flag = "";
                break;
        }
        return flag;
    },

    getLegacyName : (region) => {
      if(region === "SouthAmerica"){
          return "South America";
      }else{
          return region.replace("-", " ");
      }
    },

    getDCName : (region) => {
      return region.replace("+", " ").replace(/\b\w/g, l => l.toUpperCase());
    },

    getLoadingEmbed : () => {
      return new MessageEmbed()
          .setTitle("Loading...")
          .setDescription("<a:loading:897228738662662144> Loading data, please wait a few seconds!")
    },

    getErrorEmbed : () => {
        return new MessageEmbed()
            .setTitle("Error")
            .setDescription("<:serverdown:687048354571616327> Internal server error. Please try again later.")
    },

    getPlatformEmoji : (platform) => {
        switch(platform){
            case 'PC':
                return ':computer:';
            case 'X1':
                return '<:xbox:701532687554445513>';
            case 'PS4':
                return '<:ps4:701532687529279528>';
        }
    },

    getRankEmoji : (ctx, rank, div) => {
        const guild = ctx.guilds.cache.get(process.env.DEV_GUILD_ID);
        return guild.emojis.cache.find(emoji => emoji.name === rank.toLowerCase().replaceAll(" ", "") + div);
    },

}
