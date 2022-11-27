fx_version 'cerulean'
game 'gta5'

author 'Glowie'
description 'A scoreboard for admins'
version '1.0'

client_script 'client/client.lua'

server_scripts {
	'server/server.lua',
	'server/bot.js',
	'server/commands/*.js'
}

shared_scripts {
    '@qb-core/shared/locale.lua',
}

ui_page 'client/html/index.html'

files {
	'client/html/index.html',
	'client/html/script.js',
	'client/html/style.css',
}

lua54 'yes'