const { Client, GatewayIntentBits, Events } = require('discord.js');

const config = require('./config.json');
const { validateConfig, getAudioPlayer, getVoiceConnection } = require('./utils.js');

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});
const audioPlayer = getAudioPlayer(config.stream_url);

// For future usage, when slash commands gets implemented
const connections = {};
const connectedGuilds = [];

bot.on(Events.ClientReady, async () => {
    if (validateConfig(config)) {
        const channels = config.channel_id.split(',');
        for(let chan of channels) {
            const channel = await bot.channels.cache.get(chan);
            if (channel) {
                if (connectedGuilds.indexOf(channel.guildId) < 0) {
                    connections[channel.id] = getVoiceConnection(channel);
                    connections[channel.id].subscribe(audioPlayer);
                    connectedGuilds.push(channel.guildId);
                }
                else console.error(`There is already a active connection for ${channel.guild.name}, ignoring ${channel.name}`);
            } else console.error("Unable to fetch voice channel..");
        }
    }
});

bot.login(config.discord_token);