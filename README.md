# Fivem Admin Scoreboard With Discord Integration For QBCore

A script that allows admins to quickly view player's character info and discord roles. Discord info will only display for players that have joined your discord server and have their discord connected to FiveM.

This script also has search and filter functionality for admins to quickly find specific players. In the top right of the scoreboard there are counters that display how many admins are online, and total player count. In the config file, you can also add jobs to display as a counter. By clicking on the counter, you will filter out all player's that aren't apart of that category.

You can view a players inventory by clicking on their profile picture.

![Admin Scoreboard](https://i.imgur.com/UbEkiBd.png)
![Admin Scoreboard With Inventory](https://i.imgur.com/pHBQLxZ.png)
## Getting Started
- Drag and drop glow_admin_sb into your resource file
- Ensure you have yarn installed. Located in your resources folder at `resources\[cfx-default]\[system]\[builders]`

### Setting Up A Discord Bot
1. Visit the Discord Developer Portal at https://discord.com/developers/applications
2. In the top right click "New Application", name it anything you'd like, and click "Create"
3. Click on "Bot" on the side panel, and add a new bot to your app
![Add Disocrd Bot](https://i.imgur.com/MaEwLrX.png)

4. Copy the Bot's token, open config.json, and paste it  to "discordBotToken"
5. Under "Privileged Gateway Intents", enable "Server Members Intent"
![Enable Member Intent](https://i.imgur.com/bTuQgo6.png)
6. Click "OAuth2" in the side panel, then click "URL Generator"
7. Under "Scopes" click on "bot", scroll down, and open the generated link in your browser
![Generate Bot URL](https://i.imgur.com/3FXCRpV.png)
8. Add the bot to your discord server

### Setting Up config.json
- Get your discord server id by right clicking on your discord server and clicking copy ID. If you do not see this option, go to Settings ➝ Advanced and enable Developer Mode


Once setup is complete, run the command /adminsb to display the scoreboard 