const { Client, GatewayIntentBits, Events } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus, AudioPlayerStatus} = require('@discordjs/voice');
const config = require('./config.json');

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const resource = createAudioResource(config.stream_url, {
    inlineVolume: true
});
const audioPlayer = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

audioPlayer.play(resource);
audioPlayer.on(AudioPlayerStatus.Playing, () => {
    console.log(`AudioPlayer: started playing`);
});
audioPlayer.on(AudioPlayerStatus.Buffering, () => {
    console.log(`AudioPlayer: entered state Buffering`)
});
audioPlayer.on(AudioPlayerStatus.Idle, () => {
    console.log(`AudioPlayer: entered state idle`)
});
audioPlayer.on('error', error => {
    console.error(`AudioPlayer: Error.. ${error.message}`);
});

const validateConfig = () => {
    const keys = ['discord_token', 'channel_id', 'stream_url'];
    for (let x of keys) {
        if (!config[x]) {
            if (process.env[x.toUpperCase()]) {
                config[x] = process.env[x.toUpperCase()];
            }
            console.error(`Missing property ${x} in config.json..`);
            return false;
        }
    }
    return true;
}

// For future usage, when slash commands gets implemented
const connections = {};

bot.on(Events.ClientReady, async () => {
    if (validateConfig()) {
        const channels = config.channel_id.split(',');
        for(let chan of channels) {
            const channel = await bot.channels.cache.get(chan);
            if (channel) {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator
                });
                connection.on(VoiceConnectionStatus.Ready, () => {
                    console.log(`Connected to voice channel ${channel.name} in ${channel.guild.name} guild`);
                });
                connection.on(VoiceConnectionStatus.Disconnected, () => {
                   console.log(`Disconnected from voice channel ${channel.name} in ${channel.guild.name} guild`);
                });
                connection.subscribe(audioPlayer);
                connections[channel.id] = connection;
            } else console.error("Unable to fetch voice channel..");
        }
    }
});

bot.login(config.discord_token);