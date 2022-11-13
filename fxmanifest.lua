fx_version 'cerulean'
game 'gta5'

author 'Glowie'
description 'A scoreboard for admins'
version '1.0'

client_script 'client.lua'

server_scripts {
	'server.lua',
	'bot.js'
}

shared_scripts {
    '@qb-core/shared/locale.lua',
}

ui_page 'html/index.html'

files {
	'html/index.html',
	'html/script.js',
	'html/style.css',
}

lua54 'yes'