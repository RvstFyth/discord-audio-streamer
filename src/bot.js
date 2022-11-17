const { Client, GatewayIntentBits } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior} = require('@discordjs/voice');
const config = require('./config.json');

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const validateConfig = () => {
    const keys = ['discord_token', 'channel_id', 'stream_url'];
    for (let x of keys) {
        if (!config[x]) {
            console.error(`Missing property ${x} in config.json..`);
            return false;
        }
    }
    return true;
}

bot.on('ready', async () => {
    if (validateConfig()) {
        const resource = createAudioResource(config.stream_url, {
            inlineVolume: true
        });
        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        const channel = await bot.channels.cache.get(config.channel_id);
        if (channel) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            audioPlayer.play(resource);
            connection.subscribe(audioPlayer);
        } else console.error("Unable to fetch voice channel..");
    }
});

bot.login(config.discord_token);