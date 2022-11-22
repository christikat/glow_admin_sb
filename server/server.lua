local Config = json.decode(LoadResourceFile(GetCurrentResourceName(), "config.json"))
local QBCore = exports['qb-core']:GetCoreObject()
local discordAPI = "https://discordapp.com/api/"
local allPlayerData = {}
local playerDiscordIds = {}
local discordRoles = nil
local lastLoaded = nil

local headers = {
    ["Content-Type"] = "application/json",
    ["Authorization"] = "Bot " .. Config.discordBotToken,
}

local discordRateLimited = false

local function handleRateLimit(remainingRequests, resetSeconds)
    if not remainingRequests or tonumber(remainingRequests) > 1 then return end
    local reset = tonumber(resetSeconds) * 1000
    
    CreateThread(function()
        discordRateLimited = true
        Wait(reset)
        discordRateLimited = false
    end)
end

local function intToHex(num)
    return string.format("%x", num)
end

function updateMemberRoles(update)
    local result = json.decode(update)

    if playerDiscordIds[result.userId] then
        local newRoles = {}
        for _, role in pairs(result.roles) do
            if discordRoles[role] then
                if discordRoles[role].name ~= "@everyone" then
                    newRoles[role] = discordRoles[role]
                end
            end
        end
        allPlayerData[playerDiscordIds[result.userId]].discordData.roles = newRoles
    end
    return true
end

exports("updateMemberRoles", updateMemberRoles)

function updateRoles(update)
    local result = json.decode(update)
    
    if result.action == "delete" then
        discordRoles[result.role.id] = nil
        return
    end

    discordRoles[result.role.id] = {
        name = result.role.name, 
        position = result.role.rawPosition,
        colour = intToHex(result.role.color)
    }

    if result.action == "update" then
        for k, v in pairs(allPlayerData) do
            for l, m in pairs(v.discordData.roles) do
                if l == result.role.id then
                    allPlayerData[k].discordData.roles[l] = discordRoles[result.role.id]
                    break
                end
            end
        end
    end
end

exports("updateRoles", updateRoles)

local function getDiscordId(src)
    local discordId
    for _, identifier in pairs(GetPlayerIdentifiers(src)) do
        if string.sub(identifier, 1, string.len("discord:")) == "discord:" then
            discordId = string.gsub(identifier, "discord:", "")
            break
        end
    end
    return discordId
end

local function getCharData(src)
    local Player = QBCore.Functions.GetPlayer(src)
    local charData = {
        id = src,
        cid = Player.PlayerData.citizenid,
        name = GetPlayerName(src),
        charName = Player.PlayerData.charinfo.firstname .. " " .. Player.PlayerData.charinfo.lastname,
        job = Player.PlayerData.job.name,
        jobLabel = Player.PlayerData.job.label,
        duty = Player.PlayerData.job.onduty,
        gang = Player.PlayerData.gang.label,
        cash = Player.PlayerData.money.cash,
        bank = Player.PlayerData.money.bank,
    }
    if QBCore.Functions.HasPermission(src, 'admin') or IsPlayerAceAllowed(src, 'command') then
        charData.admin = true
    else
        charData.admin = false
    end

    return charData
end

local function getDiscordUserData(discordId)
    local promise = promise.new()
    local endPoint = ("users/%s"):format(discordId)

    while discordRateLimited do
        Wait(100)
    end

    PerformHttpRequest(discordAPI .. endPoint, function(err, data, resultHeaders)
        if err == 200 then
            handleRateLimit(resultHeaders["x-ratelimit-remaining"], resultHeaders["x-ratelimit-reset-after"])
            local result = json.decode(data)
            local userData = {
                username = result.username .. "#" .. result.discriminator,
                colour = result.banner_color
            }

            if result.avatar then
                local discordImgURL = "https://cdn.discordapp.com/avatars/" .. result.id .. "/" .. result.avatar
                if string.sub(result.avatar, 2, 2) == "_" then
                    userData.avatar = discordImgURL .. ".gif"
                else
                    userData.avatar = discordImgURL .. ".png"
                end
            end

            promise:resolve(userData)
        else
            print("^1Discord API: Error Code ".. err ..", failed to fetch discord user data^7")
            promise:resolve(nil)
        end
    end, "GET", nil, headers)

    return Citizen.Await(promise)
end

local function getDiscordServerRoles()
    local promise = promise.new()
    local endPoint = "guilds/".. Config.discordServerId .. "/roles"
    
    while discordRateLimited do
        Wait(100)
    end

    PerformHttpRequest(discordAPI .. endPoint, function(err, data, resultHeaders)
        if err == 200 then
            local discordServerRoles = {}
            for _, role in ipairs(json.decode(data)) do
                local hexColour = intToHex(role.color)
                discordServerRoles[role.id] = {
                    name = role.name,
                    position = role.position,
                    colour = hexColour,
                }
            end
            promise:resolve(discordServerRoles)
        else
            print("^1Discord API: Error Code ".. err ..", failed to fetch discord server roles^7")
            promise:resolve(nil)
        end
    end, "GET", nil, headers)

    return Citizen.Await(promise)
end

local function getDiscordUserRoles(discordId)
    if not discordRoles then return end
    local promise = promise.new()
    local endPoint = ("guilds/%s/members/%s"):format(Config.discordServerId, discordId)
    
    while discordRateLimited do
        Wait(100)
    end

    PerformHttpRequest(discordAPI .. endPoint, function(err, data, resultHeaders)
        if err == 200 then
            handleRateLimit(resultHeaders["x-ratelimit-remaining"], resultHeaders["x-ratelimit-reset-after"])
            local result = json.decode(data)
            local userRoles = {}
            if result.roles then
                for _, roleId in pairs(result.roles) do
                    if discordRoles[roleId] then
                        userRoles[roleId] = discordRoles[roleId]
                    end
                end
            end
            promise:resolve(userRoles)
        else
            print("^1Discord API: Error Code ".. err ..", failed to fetch discord user roles^7")
            promise:resolve(nil)
        end
    end, "GET", nil, headers)

    return Citizen.Await(promise)
end


local function fetchAllPlayerData()
    discordRoles = getDiscordServerRoles()

    for _, player in pairs(QBCore.Functions.GetQBPlayers()) do
        local playerSrc = player.PlayerData.source
        allPlayerData[tostring(player.PlayerData.source)] = {
            charData = getCharData(playerSrc),
            discordData = {},
        }
        
        if discordRoles then
            local discordId = getDiscordId(playerSrc)
            if discordId then
                playerDiscordIds[discordId] = tostring(playerSrc)
                allPlayerData[tostring(player.PlayerData.source)].discordData = getDiscordUserData(discordId)
                
                if allPlayerData[tostring(player.PlayerData.source)].discordData then
                    allPlayerData[tostring(player.PlayerData.source)].discordData.roles = getDiscordUserRoles(discordId)
                end
            end
        end
    end

    lastLoaded = os.time()
end

QBCore.Commands.Add('adminsb', 'Open Admin Scoreboard', {}, false, function(source)
    while not lastLoaded do
        Wait(500)
    end
    
    if (os.time() - lastLoaded) > Config.loadCooldown then
        for _, player in pairs(QBCore.Functions.GetQBPlayers()) do
            local playerSrc = player.PlayerData.source
            allPlayerData[tostring(player.PlayerData.source)].charData = getCharData(playerSrc)
        end
        lastLoaded = os.time()
    end
    TriggerClientEvent("glow_admin_sb_cl:displayScoreboard", source, allPlayerData)
end, 'admin')

QBCore.Functions.CreateCallback("glow_admin_sb_sv:setupUI", function(source, cb)
    cb(Config.jobCounter)
end)

QBCore.Functions.CreateCallback("glow_admin_sb_sv:refresh", function(source, cb)
    for _, player in pairs(QBCore.Functions.GetQBPlayers()) do
        local playerSrc = player.PlayerData.source
        allPlayerData[tostring(player.PlayerData.source)].charData = getCharData(playerSrc)
    end
    lastLoaded = os.time()
    cb(allPlayerData)
end)

QBCore.Functions.CreateCallback("glow_admin_sb_sv:playerInventory", function(source, cb, otherSrc)
    if QBCore.Functions.HasPermission(source, 'admin') or IsPlayerAceAllowed(source, 'command') then
        local OtherPlayer = QBCore.Functions.GetPlayer(tonumber(otherSrc))
        if OtherPlayer then
            cb(OtherPlayer.PlayerData.items)
        end
    end
end)

RegisterNetEvent("glow_admin_sb_sv:loadPlayerData", function()
    local src = source
    
    if allPlayerData[tostring(src)] then
        allPlayerData[tostring(src)].charData = getCharData(src)
    else
        allPlayerData[tostring(src)] = {
            charData = getCharData(src),
            discordData = {},
        }
        
        if discordRoles then
            local discordId = getDiscordId(src)
            if discordId then
                playerDiscordIds[discordId] = tostring(src)
                allPlayerData[tostring(src)].discordData = getDiscordUserData(discordId)
                
                if allPlayerData[tostring(src)].discordData then
                    allPlayerData[tostring(src)].discordData.roles = getDiscordUserRoles(discordId)
                end
            end
        end
    end
end)

RegisterNetEvent("glow_admin_sb_sv:unloadPlayerData", function()
    local src = source
    allPlayerData[tostring(src)].charData = nil
end)

AddEventHandler("playerDropped", function()
    local src = source
    allPlayerData[tostring(src)] = nil
    for discordId, playerId in ipairs(playerDiscordIds) do
        if playerId == tostring(src) then
            playerDiscordIds[discordId] = nil
            break
        end
    end
end)

AddEventHandler("onResourceStart", function(resource)
    if resource == GetCurrentResourceName() then
        SetTimeout(2000, function()
            fetchAllPlayerData()
        end)
    end
end)