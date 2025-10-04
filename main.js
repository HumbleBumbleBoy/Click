class ClickStats {
    /**
     * @param {number} pointsPerClick
     * @param {Date} lastClickTime
     */
    constructor(pointsPerClick, lastClickTime) {
        this.pointsPerClick = pointsPerClick;
        this.lastClickTime = lastClickTime;
    }
}

class Upgrade {
    constructor(id, category, name, tooltip, cost, oneTime) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.tooltip = tooltip;
        this.cost = cost;
        this.oneTime = oneTime;
    }

    apply(clickStats) {
        /* abstract apply(clickState); */
        /* nya :3 */
    }

    createElement(quantity) {
        const template = document.getElementById(
            `upgradeTemplate_${quantity === 0 ? "no" : "with"}Quantity`
        );

        const element = template.content.cloneNode(true).firstElementChild;
        element.innerHTML = element.innerHTML.replace("${name}", this.name);
        element.innerHTML = element.innerHTML.replace(
            "${cost}",
            Math.ceil(this.calculateCost(quantity))
        );
        element.onclick = () => buyUpgrade(this.id);
        if (quantity !== 0) {
            element.innerHTML = element.innerHTML.replace(
                "${quantity}",
                quantity
            );
        }

        return element;
    }

    calculateCost(quantity) {
        return Math.max(this.cost, Math.pow(this.cost, 1.025) * quantity);
    }
}

class PointsPerSecondUpgrade extends Upgrade {
    constructor(id, category, name, tooltip, cost, oneTime, increaseAmount) {
        super(id, category, name, tooltip, cost, oneTime);
        this.increaseAmount = increaseAmount;
    }

    apply(clickStats) {
        const now = Date.now();
        const timeDiff = now - clickStats.lastClickTime;
        if (timeDiff < 1000) {
            return;
        }

        clickStats.pointsPerClick += this.increaseAmount;
    }
}

class PointsPerClickUpgrade extends Upgrade {
    constructor(id, category, name, tooltip, cost, oneTime, increaseAmount) {
        super(id, category, name, tooltip, cost, oneTime);
        this.increaseAmount = increaseAmount;
    }

    apply(clickStats) {
        clickStats.pointsPerClick += this.increaseAmount;
    }
}

class CosmeticUpgrade extends Upgrade {
    constructor(id, category, name, tooltip, cost, oneTime) {
        super(id, category, name, tooltip, cost, oneTime);
    }
}

const pointsText = document.getElementById("points");
const CPSText = document.getElementById("CPSText");
const CPCText = document.getElementById("CPCText");

const points = {
    value: undefined,

    get() {
        return this.value;
    },

    set(newValue) {
        if (this.value === newValue) {
            return;
        }

        this.value = newValue;

        pointsText.innerHTML = Math.round(this.value);
        renderUpgrades();
    },

    increase(amount) {
        this.set(this.value + amount);
    },

    decrease(amount) {
        this.set(Math.max(0, this.value - amount)); // TODO financial debt
    },
};
let lastClickTime = undefined;

const availableUpgrades = {
    user: [],
    automatic: [],
    cosmetic: [],
};

const boughtUpgrades = {
    user: [
        new PointsPerClickUpgrade(
            "default_click1",
            "CPC Upgrade",
            "Click 1",
            "Increases click by 1",
            0,
            false,
            1
        ),
    ],
    automatic: [],
    cosmetic: [],
};

points.set(0);

function applyClickUpgrades(lastClickTime, isUserClick) {
    const stats = new ClickStats(0, lastClickTime);
    if (isUserClick) {
        boughtUpgrades.user.forEach((upgrade) => upgrade.apply(stats));
    }

    boughtUpgrades.automatic.forEach((upgrade) => upgrade.apply(stats));
    return stats;
}

function userClick() {
    const stats = applyClickUpgrades(lastClickTime, true);

    points.increase(stats.pointsPerClick);
    updateStats();
}

function automaticClick() {
    const stats = applyClickUpgrades(lastClickTime, false);
    lastClickTime = Date.now();

    points.increase(stats.pointsPerClick);
    updateStats();
}

function countUpgradeQuantity(upgradeId) {
    let quantity = 0;
    for (const category in boughtUpgrades) {
        quantity += boughtUpgrades[category].filter(
            (upgrade) => upgrade.id === upgradeId
        ).length;
    }
    return quantity;
}

function sortAvailableUpgrades() {
    for (const category in availableUpgrades) {
        availableUpgrades[category].sort((a, b) => a.cost - b.cost);
    }
}

function findUpgradeById(upgradeId, removeIfOneTime = false) {
    for (const category in availableUpgrades) {
        const upgrade = availableUpgrades[category].find(
            (upg) => upg.id === upgradeId
        );

        if (!upgrade) {
            continue;
        }

        if (removeIfOneTime && upgrade.oneTime) {
            const index = availableUpgrades[category].indexOf(upgrade);
            if (index > -1) {
                availableUpgrades[category].splice(index, 1);
            }
        }

        return {
            upgrade,
            category,
        };
    }

    return null;
}

function loadUpgradesFromData(data, upgradeInserters, upgradeReaders) {
    for (const category in data) {
        data[category].forEach((upgradeData) => {
            const upgrade = upgradeReaders[category](upgradeData);
            upgradeInserters[category](upgrade);
        });
    }
}

function renderUpgrades() {
    sortAvailableUpgrades();

    for (const category in availableUpgrades) {
        deleteShelf(category);

        for (const upgrade of availableUpgrades[category]) {
            const element = upgrade.createElement(
                countUpgradeQuantity(upgrade.id)
            );
            if (!element) continue;

            const canBuy =
                points.get() >=
                upgrade.calculateCost(countUpgradeQuantity(upgrade.id));
            if (canBuy) {
                element.classList.remove("upgradeLocked");
                element.classList.add("upgradeAvailable");
            } else {
                element.classList.remove("upgradeAvailable");
                element.classList.add("upgradeLocked");
            }

            getOrCreateShelf(category, "leftUpgradeDiv").appendChild(element);
        }
    }
}

function buyUpgrade(upgradeId) {
    const result = findUpgradeById(upgradeId, true);
    if (!result) {
        console.error(`Upgrade with ID ${upgradeId} not found.`);
        return false;
    }

    const overallCost = result.upgrade.calculateCost(
        countUpgradeQuantity(upgradeId)
    );

    if (points.get() < overallCost) {
        console.error("Not enough points to buy this upgrade.");
        if (result.upgrade.oneTime) {
            availableUpgrades[result.category].push(result.upgrade);
        }
        return false;
    }

    points.decrease(overallCost);

    boughtUpgrades[result.category].push(result.upgrade);
    updateStats();
    renderUpgrades();
    return true;
}

fetch("database.json")
    .then((data) => data.json())
    .then((jsonData) => {
        loadUpgradesFromData(
            jsonData,
            {
                CPS_upgrades: (upgrade) =>
                    availableUpgrades.automatic.push(upgrade),
                CPC_upgrades: (upgrade) => availableUpgrades.user.push(upgrade),
                Cosmetic_upgrades: (upgrade) =>
                    availableUpgrades.cosmetic.push(upgrade),
            },
            {
                CPS_upgrades: (data) =>
                    new PointsPerSecondUpgrade(
                        data.upgrade_id,
                        "CPS Upgrade",
                        data.upgrade_name,
                        data.upgrade_tooltip,
                        data.upgrade_cost,
                        data.upgrade_oneTime,
                        data.upgrade_increaseCPSby
                    ),
                CPC_upgrades: (data) =>
                    new PointsPerClickUpgrade(
                        data.upgrade_id,
                        "CPC Upgrade",
                        data.upgrade_name,
                        data.upgrade_tooltip,
                        data.upgrade_cost,
                        data.upgrade_oneTime,
                        data.upgrade_increaseCPCby
                    ),
                Cosmetic_upgrades: (data) =>
                    new CosmeticUpgrade(
                        data.upgrade_id,
                        "Cosmetic Upgrade",
                        data.upgrade_name,
                        data.upgrade_tooltip,
                        data.upgrade_cost,
                        data.upgrade_oneTime
                    ),
            }
        );

        updateStats();
        renderUpgrades();

        setInterval(automaticClick, 1000);
    })
    .catch((error) => {
        console.error("Error loading upgrades:", error);
    });

function getOrCreateShelf(categoryId, parentContainer) {
    let tierSection = document.getElementById(categoryId);
    if (!tierSection) {
        const template = document.getElementById("upgradeCategory");
        tierSection = template.content.cloneNode(true).firstElementChild;
        tierSection.id = categoryId;

        parentContainer = document.getElementById(parentContainer);
        parentContainer.appendChild(tierSection);
    }
    return tierSection;
}

function deleteShelf(categoryId) {
    let tierSection = document.getElementById(categoryId);
    if (tierSection) {
        tierSection.remove();
    }
}

function updateStats() {
    const fullStats = applyClickUpgrades(new Date(0, 0, 1, 0, 0, 0, 0), true);
    console.log(fullStats);
    const partialStats = applyClickUpgrades(
        new Date(0, 0, 1, 0, 0, 0, 0),
        false
    );

    const cps = partialStats.pointsPerClick;
    const cpc = fullStats.pointsPerClick - cps;

    CPSText.innerHTML = `CPS: <span>${Math.round(cps * 10) / 10}</span>`;
    CPCText.innerHTML = `CPC: <span>${Math.round(cpc * 10) / 10}</span>`;
}
