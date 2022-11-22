const scriptName = "glow_admin_sb";
const inventoryScript = "qb-inventory"
let jobs, maxPlayers, filter;

$.extend($.expr[":"],
{
    "contains-ci": function(elem, i, match, array)
    {
        return (elem.textContent || elem.innerText || $(elem).text() || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});

function setupUI(data) {
    let jobCountEl = "";
    jobs = data;
    $(".job-count").remove();
    
    for (const job in data) {
        jobCountEl += `
        <div id="${job}-count" class="job-count counter" data-counter="${job}">
            <div class="counter-tooltip">${data[job].label}</div>
            <i class="${data[job].icon}"></i>
            <span></span>
        </div>`;

        jobs[job].count = 0;
    }
    $(jobCountEl).insertAfter("#admin-count")
}

function displayDuty(job) {
    if (jobs.hasOwnProperty(job)) {
        return true
    }
}

function resetJobCount() {
    for (const job in jobs) {
        jobs[job].count = 0;
    }
}

function displayScoreboardData(data) {
    resetJobCount();
    let playerCount = 0;
    let adminCount = 0;
    $("#search").val("");
    $(".selected").removeClass("selected");
    
    $("#user-cards").empty();
    for (const item in data) {
        let discordRoles = "";
        const discordData = data[item].discordData;
        const charData = data[item].charData;
        
        if (discordData.roles) {
            const sortedRoles = Object.values(discordData.roles).sort((a, b) => b.position - a.position);
            for (const role in sortedRoles) {
                discordRoles += `
                <div class="role">
                    <div class="role-name"><i class="fa-solid fa-circle role-dot" style="color: #${sortedRoles[role].colour};"></i> ${sortedRoles[role].name}</div>
                </div>`;
            }
        } else {
            discordRoles = `
            <div class="role">
                <div class="role-name"><i class="fa-solid fa-circle-xmark role-dot" style="color: #ed4245;"></i> Discord Not Connected</div>
            </div>`;
        }

        if (charData) {
            const dutyEl = charData.duty ?
                `<i class="fa-regular fa-circle-check duty-dot" style="color: #3ba55d;"><div class="duty-tooltip">On Duty</div></i>` :
                `<i class="fa-regular fa-circle-xmark duty-dot" style="color: #ed4245;"><div class="duty-tooltip">Off Duty</div></i>`;
            
            $("#user-cards").append(`
            <div class="user-card" data-serverId="${item}">
                <div class="svg-background" ${discordData.colour ? `style="background-color: ${discordData.colour};"` : ""}></div>
                <div class="svg-background2"></div>
                <div class="user-img">
                    ${discordData.avatar ? `<img src="${discordData.avatar}">`: `<i class="fa-solid fa-user profile-icon"></i>`}
                </div>
                <div class="server-id">ID ${item}</div>
                <div class="user-info" data-admin="${charData.admin}">
                    <div class="discord-name">${discordData.username || charData.name}</div>
                    <div class="char-name">Name: ${charData.charName}</div>
                    <div class="player-cid">CID: ${charData.cid}</div>
                    <div class="player-money">Cash: $${charData.cash.toLocaleString("en-US")} | Bank: $${charData.bank.toLocaleString("en-US")}</div>
                    <div class="player-job" data-job="${charData.job}">
                        ${displayDuty(charData.job) ? dutyEl : ""} ${charData.jobLabel} | ${charData.gang}
                    </div>
                    <div class="discord-roles">${discordRoles}</div>
                </div>
            </div>
            `)

            playerCount++;

            if (charData.admin) {
                adminCount++;
            }

            if (displayDuty(charData.job)) {
                if (jobs[charData.job].checkDuty) {
                    if (charData.duty) {
                        jobs[charData.job].count++;
                    }
                } else {
                    jobs[charData.job].count++;
                }
            }
        }
    }

    $("#player-count span").text(`${playerCount}/${maxPlayers}`);
    $("#admin-count span").text(adminCount);

    for (const job in jobs) {
        $(`#${job}-count span`).text(jobs[job].count);
    }
}

$("#top-container").on("click", ".counter", function() {
    if ($(this).attr("id") == "refresh") {
        $.post(`https://${scriptName}/refresh`, JSON.stringify({}), function(data) {
            if (data) {
                displayScoreboardData(data);
            }
        });
        return
    }
    
    if ($(this).attr("id") == "player-count" || $(this).hasClass("selected")) {
        const searchTerm = $("#search").val().toLowerCase();
        filter = null;
        $(".counter").removeClass("selected");
        $(".user-card").show();
        $('.user-card:not(:contains-ci("'+searchTerm+'"))').hide();
        return
    }

    const counterType = $(this).attr("data-counter");
    filter = counterType;
   
    $(".counter").removeClass("selected");
    $(this).addClass("selected");
   
    const searchTerm = $("#search").val().toLowerCase();
    $(".user-card").show();
    $('.user-card:not(:contains-ci("'+searchTerm+'"))').hide();
    
    if (counterType == "admin") {
        $(`[data-admin="false"]`).parent().hide();
    } else {
        $(`.player-job:not([data-job="${counterType}"])`).parent().parent().hide();
    }    
})

$("#search").on("keyup", function() {
    const searchTerm = $(this).val().toLowerCase();

    $(".user-card").show();
    $('.user-card:not(:contains-ci("'+searchTerm+'"))').hide();
    if (filter) {
        if (filter == "admin") {
            $(`[data-admin="false"]`).parent().hide();
        } else {
            $(`.player-job:not([data-job="${filter}"])`).parent().parent().hide();
        }
    }
})

$(".player-inventory-container").on("click", function(e) {
    if (e.target !== this) return;
    $("#top-container").css("filter", "blur(0)");
    $("#cards-container").css("filter", "blur(0)");

    $(".player-inventory-container").fadeOut();
    $(".player-inventory-slots").empty();
})

$("#user-cards").on("click", ".user-card .user-img", function() {
    $.post(`https://${scriptName}/getInventoryData`, JSON.stringify({serverId: $(this).parent().attr("data-serverId")}), function(inventoryData) {
        if (inventoryData) {
            if (Array.isArray(inventoryData)) {
                inventoryData.forEach(item => {
                    $(".player-inventory-slots").append(`
                    <div class="inventory-slot">
                        <div class="inv-name">${item.label}</div>
                        <div class="inv-img">
                            <img src="https://cfx-nui-${inventoryScript}/html/images/${item.image}" alt="">
                        </div>
                        <div class="inv-item-data">
                            <div class="inv-amt">${item.amount}x</div>
                            <div class="inv-weigtht">${(item.amount*item.weight/1000).toFixed(1)}</div>
                        </div>
                    </div>
                    `);
                })
            } else {
                for (const item in inventoryData) {
                    $(".player-inventory-slots").append(`
                    <div class="inventory-slot">
                        <div class="inv-name">${inventoryData[item].label}</div>
                        <div class="inv-img">
                            <img src="https://cfx-nui-${inventoryScript}/html/images/${inventoryData[item].image}" alt="">
                        </div>
                        <div class="inv-item-data">
                            <div class="inv-amt">${inventoryData[item].amount}x</div>
                            <div class="inv-weigtht">${(inventoryData[item].amount*inventoryData[item].weight/1000).toFixed(1)}</div>
                        </div>
                    </div>
                    `);
                }
            }

            $("#top-container").css("filter", "blur(0.2vh)");
            $("#cards-container").css("filter", "blur(0.2vh)");

            $(".player-inventory-container").fadeIn();
        }
    });
})

$(document).keyup(function(e){
    if (e.key == "Escape") {
        $.post(`https://${scriptName}/close`, JSON.stringify({}));
    }
})

window.addEventListener("message", function(event) {
    const item = event.data;

    if (item.action == "show") {
        displayScoreboardData(item.playerData);
        $("#admin-container").fadeIn();
    } else if (item.action == "hide") {
        $("#admin-container").fadeOut();
    } else if (item.action == "setupUI") {
        setupUI(item.data);
        maxPlayers = item.maxPlayers;
        displayScoreboardData(item.playerData);
        $("#admin-container").fadeIn();
    }
})