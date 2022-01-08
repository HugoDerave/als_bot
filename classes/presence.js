module.exports = class presence{

    //This class handles the bot presence. It will loop between x status every 30s.

    constructor(ctx) {
        this.statusIndex = 0;
        this.ctx = ctx;

        this.updateStatus();

        setInterval(() => {
            this.updateStatus()
        },30000);
    }

    updateStatus() {

        let totalMembers = 0;
        let totalGuilds = 0;

        this.ctx.guilds.cache.forEach((guild) => {
            totalGuilds++;
            totalMembers += guild.members.cache.size;
        });

        let status = [
            {status: 'online', activities: [{ name: `${this.utilsThousandsSeparator(totalMembers)} users 👀 || /help`, type: "WATCHING"}]},
            {status: 'online', activities: [{ name: `${this.utilsThousandsSeparator(totalGuilds)} servers 👀 || /help`, type: "WATCHING"}]},
            {status: 'online', activities: [{ name: "apexlegendsstatus.com/discord || /help", type: "WATCHING"}]}
        ];

        this.ctx.user.setPresence(status[this.statusIndex])

        if(status.length === this.statusIndex + 1){
            this.statusIndex = 0;
        }else{
            this.statusIndex++;
        }

    }

    utilsThousandsSeparator(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

}