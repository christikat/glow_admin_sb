local QBCore = exports['qb-core']:GetCoreObject()
local maxPlayers = GetConvarInt('sv_maxclients', 48)
local setupUI = false

local function displaySB()
    TriggerScreenblurFadeIn(500)
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "show"
    })
end

local function hideAdminSB()
    TriggerScreenblurFadeOut(500)
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "hide"
    })
end

RegisterNetEvent("glow_admin_sb_cl:displayScoreboard", function(data)
    if not setupUI then
        QBCore.Functions.TriggerCallback("glow_admin_sb_sv:setupUI", function(jobData)
            SendNUIMessage({
                action = "setupUI",
                data = jobData,
                maxPlayers = maxPlayers,
                playerData = data,
            })
            setupUI = true
        end)
    else
        SendNUIMessage({
            action = "show",
            playerData = data,
        })
    end

    TriggerScreenblurFadeIn(500)
    SetNuiFocus(true, true)
end)

RegisterNUICallback("refresh", function(data, cb)
    QBCore.Functions.TriggerCallback("glow_admin_sb_sv:refresh", function(playerData)
        cb(playerData)
    end)
end)

RegisterNUICallback("getInventoryData", function(data, cb)
    QBCore.Functions.TriggerCallback("glow_admin_sb_sv:playerInventory", function(inventoryData)
        cb(inventoryData)
    end, data.serverId)
end)

RegisterNUICallback("close", function(data, cb)
    hideAdminSB()
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    TriggerServerEvent("glow_admin_sb_sv:loadPlayerData")
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    TriggerServerEvent("glow_admin_sb_sv:unloadPlayerData")
end)