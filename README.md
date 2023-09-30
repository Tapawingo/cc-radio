# CC-Radio
> CC-Radio is a Discord Music Bot built with TypeScript and discord.js for Cluster Community.
## Requirements
1. Discord Bot Token ([Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot))<br>
1.1. Enable "Message Content Intent" in Discord Developer Portal
2. Node.js =<16.11.0

## Getting Started
```bash
git clone https://github.com/Tapawingo/cc-radio.git
cd cc-radio
npm install
```
After installation configure the bot in `bot.config.json` then run `npm run start` to start the bot.

## Configuration
Copy or Rename `bot.config.example.json` to `bot.config.json` and fill out the values:
```json
{
    "auth": {
        "app_id": "",
        "public_key": "",
        "bot_token": ""
    }
}
```

If you want to enable playing region locked or age restricted youtube videos add your youtube cookie in handler settings:
```json
    "handlerSettings": {
        "youtube": {
            "cookie": ""
        },
    }
```

Additionally if you want to allow playing spotify links fill out the following:
```json
    "handlerSettings": {
        "spotify": {
            "client_id": "",
            "client_secret": "",
            "refresh_token": "",
            "market": ""
        }
    }
```

## Commands
- `.help (.h)` <br> Displays a list of all available commands
- `.play (.p)` <br> Plays a given query
- `.nowPlaying (.np)` <br> Shows info on what's currently playing
- `.queue (.q)` <br> Displays current queue
- `.skip (.s)` <br> Skips current song
- `.skipTo (.st)` <br> Skips to given track in queue
- `.purge (.pu)` <br> Purges current queue
- `.leave (.l)` <br> Make bot leave Voice Channel

## Contributing
You can help out with the ongoing development by looking for potential bugs in the framework, or by contributing new features. I'm always welcoming new pull requests containing bug fixes, refactors and new features. 

The bot has been built with modularity in mind and you can easily add new source handlers and commands.
### Contribution guidelines
To contribute something to **CC-Radio**, simply fork this repository and submit your pull request for review by other collaborators.
### Submiting issues and requesting features
Please use our [Issue Tracker](https://github.com/Tapawingo/cc-radio/issues) to report a bug, propose a feature, or suggest changes to existing ones.
## License
**CC-Radio** is licensed under the GNU General Public License ([GLPv3](https://github.com/Tapawingo/cc-radio/blob/main/LICENSE)).