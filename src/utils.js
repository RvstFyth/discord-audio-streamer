const { createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

let audioPlayer;

const validateConfig = (config) => {
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

const getAudioPlayer = (streamUrl) => {
    if (!audioPlayer) {
        audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        const play = () => {
            const resource = createAudioResource(streamUrl, {
                inlineVolume: true
            });
            audioPlayer.play(resource);
        }

        audioPlayer.on(AudioPlayerStatus.Playing, () => {
            console.log(`AudioPlayer: started playing`);
        });
        audioPlayer.on(AudioPlayerStatus.Buffering, () => {
            console.log(`AudioPlayer: entered state Buffering`)
        });
        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log(`AudioPlayer: entered state idle`);
            console.log(`AudioPlayer: trying to reconnect in 10 seconds`);
            setTimeout(play, 10 * 1000);
        });
        audioPlayer.on('error', error => {
            console.error(`AudioPlayer: Error.. ${error.message}`);
            console.log(`AudioPlayer: trying to reconnect in 10 seconds`);
            setTimeout(play, 10 * 1000);
        });

        play();
    }

    return audioPlayer;
}

const getVoiceConnection = (channel) => {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
    });
    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(`Connected to voice channel ${channel.name} in ${channel.guild.name} guild`);
    });
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log(`Disconnected from voice channel ${channel.name} in ${channel.guild.name} guild.`);
        setTimeout(connection.rejoin, 10 * 1000);
    });

    return connection;
}

module.exports = {
    validateConfig,
    getAudioPlayer,
    getVoiceConnection
}