const pointsText = document.getElementById("points");
const CPSText = document.getElementById("CPSText");
const CPCText =  document.getElementById("CPCText");

let originalData;
let dynamicData = {};
let points = 1000;  // debug purposes
pointsText.innerHTML = points;
let pointsToAdd = 1;
let pointsPerSecond = 0;
updateStats();

fetch("database.json")
    .then(data => data.json())
    .then(jsonData => {
        originalData = jsonData;
        initializeDynamicData();
        createUpgradeElements();
    })
    .catch(error => {
    console.error('Error loading upgrades:', error);
});

function initializeDynamicData() {
    originalData.infinite_upgrades.forEach(upgrade => {
        dynamicData[upgrade.upgrade_id] = {
            upgradeId: upgrade.upgrade_id,
            upgradeQuantity: upgrade.upgrade_quantity,
            upgradeCost: upgrade.upgrade_cost
    }
    });    
}

function createUpgradeElements() {
    originalData.infinite_upgrades.forEach(upgrade => {
        let id = upgrade.upgrade_id
        let name = upgrade.upgrade_name;
        let tooltip = upgrade.upgrade_tooltip;
        let quantity = upgrade.upgrade_quantity;
        let cost = upgrade.upgrade_cost;
        let CPCincrease = upgrade.upgrade_upgrade_increaseCPCby;
        let CPSincrease = upgrade.upgrade_upgrade_increaseCPSby;

        const attributes = {
            'data-id': id,
            'data-name': name,
            'data-tooltip': tooltip,
            'data-quantity': quantity,
            'data-cost': cost,
            'data-CPCincrease': CPCincrease,
            'data-CPSincrease': CPSincrease
        }

        const templateDiv = document.createElement("div");
        templateDiv.classList.add("leftDivChildElement");
        for (const [key, value] of Object.entries(attributes)) {
            templateDiv.setAttribute(key, value);
        }
        templateDiv.innerHTML = `
            <p class="nameText">${name}</p>
            <p class="costText">Cost: ${cost}</p>
        `
        const tierOneUpgradesSection = document.getElementById("tierOneUpgrades");
        tierOneUpgradesSection.appendChild(templateDiv);
    });
    // You might say this is inefficent cause im repeating the exact same code with like 3 things changed, i say to that: go fuck yourself, thanks
    originalData.finite_upgrades.forEach(upgrade => { 
        let id = upgrade.upgrade_id
        let name = upgrade.upgrade_name;
        let tooltip = upgrade.upgrade_tooltip;
        let cost = upgrade.upgrade_cost;
        let CPCincrease = upgrade.upgrade_upgrade_increaseCPCby;
        let CPSincrease = upgrade.upgrade_upgrade_increaseCPSby;

        const attributes = {
            'data-id': id,
            'data-name': name,
            'data-tooltip': tooltip,
            'data-cost': cost,
            'data-CPCincrease': CPCincrease,
            'data-CPSincrease': CPSincrease
        }

        const templateDiv = document.createElement("div");
        templateDiv.classList.add("leftDivChildElement");
        for (const [key, value] of Object.entries(attributes)) {
            templateDiv.setAttribute(key, value);
        }
        templateDiv.innerHTML = `
            <p class="nameText">${name}</p>
            <p class="costText">Cost: ${cost}</p>
        `
        const tierTwoUpgradesSection = document.getElementById("tierTwoUpgrades");
        tierTwoUpgradesSection.appendChild(templateDiv);
    });
};



function addPoints() {
    points += pointsToAdd;
    updateStats();
}

function spendMoney(cost) {
    points -= cost;
    updateStats();
}

function updateStats() {
    CPCText.innerHTML = `CPC: <span>${pointsToAdd}</span>`;
    CPSText.innerHTML = `CPS: <span>${pointsPerSecond}</span>`;
    pointsText.innerHTML = points;
}
