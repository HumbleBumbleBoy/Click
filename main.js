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

        originalData.infinite_upgrades.forEach(upgrade => {
            dynamicData[upgrade.upgrade_id] = {
                upgradeId: upgrade.upgrade_id,
                upgradeQuantity: upgrade.upgrade_quantity,
                upgradeCost: upgrade.upgrade_cost
        }
        });
    })
    .catch(error => {
    console.error('Error loading upgrades:', error);
});

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

/*
const testInsert = document.createElement("div");
testInsert.classList.add("testClass", "penisman");
let dataId = "penischild";
let dataName = "test name";
let dataCost = 50;
testInsert.setAttribute("data-test", dataId);
testInsert.innerHTML = `
<p>${dataName}</p>
<b>but ${dataCost} fr</b>
`;
const tierOneUpgradesSection = document.getElementById("tierOneUpgrades");
tierOneUpgradesSection.appendChild(testInsert);
*/