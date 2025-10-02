const pointsText = document.getElementById("points");
const CPSText = document.getElementById("CPSText");
const CPCText =  document.getElementById("CPCText");
let gameData;

let points = 1000;
pointsText.innerHTML = points;
let pointsToAdd = 1;
let pointsPerSecond = 0;
updateStats();

fetch("database.json")
    .then(data => data.json())
    .then(jsonData => {
        gameData = jsonData;
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