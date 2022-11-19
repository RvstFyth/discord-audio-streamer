# Discord audio streamer
Discord bot that streams an online audio stream to a discord voice channel. It tries to reconnect with a interval of 10 seconds when the connection with the remote source is lost.

## Getting started
Create a discord token on https://discord.com/developers/applications.
- `git clone git@github.com:RvstFyth/discord-audio-streamer.git`
- `cd discord-audio-streamer/src`
- `npm i`
- `node bot.js`

After following the steps above, open `src/config.json` and fill in the token, a discord channel_id (needs to be a voice channel!) and a stream_url.

### Docker
- todo

## Streaming the same content to multiple voice channels.
You can only connect to one voice channel in a guild at a time. But you can stream the same content to multiple channels in different guilds. The `channel_id` property in the config accepts a comma separated string. 