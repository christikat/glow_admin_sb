# Fivem Admin Scoreboard With Discord Integration For QBCore

A script that allows admins to quickly view player's character info and discord roles. Discord info will only display for players that have joined your discord server and have their discord connected to FiveM.

This script also has search and filter functionality for admins to quickly find specific players. In the top right of the scoreboard there are counters that display how many admins are online, and total player count. In the config file, you can also add jobs to display as a counter. By clicking on the counter, you will filter out all player's that aren't apart of that category.

You can view a players inventory by clicking on their profile picture.

- Running the command `/adminsb` in game will display the scoreboard 
![Admin Scoreboard](https://i.imgur.com/UbEkiBd.png)
![Admin Scoreboard With Inventory](https://i.imgur.com/pHBQLxZ.png)
- The command `/scoreboard` in discord will show how many players are online, how many admins are online, and how many players with each job that you've set in the config

![Discord Scoreboard](https://i.imgur.com/mI0Az8b.png)
- The command `/playerlist` will display a list of all players with their server id, character name, job, and duty status

![Discord Scoreboard](https://i.imgur.com/4SdB61G.png) 
- In game commands are locked to admins, while discord commands are locked to those that have discord permissions to ban other discord members in your server

## Getting Started
- Drag and drop glow_admin_sb into your resource file
- Ensure you have yarn installed. Located in your resources folder at `resources\[cfx-default]\[system]\[builders]`

### Setting Up A Discord Bot
1. Visit the Discord Developer Portal at https://discord.com/developers/applications
2. In the top right click "New Application", name it anything you'd like, and click "Create"
3. In "General Information", find your "Application ID" and paste it to "applicationId" in config.json
![Application ID](https://i.imgur.com/Bj9x3lv.png)
4. Click on "Bot" on the side panel, and add a new bot to your app
![Add Disocrd Bot](https://i.imgur.com/MaEwLrX.png)
5. Copy the Bot's token, open config.json, and paste it  to "discordBotToken"
6. Under "Privileged Gateway Intents", enable "Server Members Intent"
![Enable Member Intent](https://i.imgur.com/bTuQgo6.png)
7. Click "OAuth2" in the side panel, then click "URL Generator"
8. Under "Scopes" click on "bot", scroll down, and open the generated link in your browser
![Generate Bot URL](https://i.imgur.com/3FXCRpV.png)
9. Add the bot to your discord server

### Setting Up config.json
- See steps 3 and 5 above to get your "applicationId" and your "discordBotToken"
- Get your discord server id by right clicking on your discord server and clicking copy ID. If you do not see this option, go to Settings ➝ Advanced and enable Developer Mode
