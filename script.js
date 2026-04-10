import vehicles from './vehicles.js';

const rarityValues = {
    Secret: 5000,
    Limited: 1500,
    Legendary: 1000,
    Epic: 100,
    Rare: 50,
    Common: 20,
    Custom: 100
};

const rarityOrder = {
    "Secret": 1,
    "Custom": 2,
    "Limited": 3,
    "Legendary": 4,
    "Epic": 5,
    "Rare": 6,
    "Common": 7
};

let valuecontent = "";
let cardscontent = "";

const valueTextElement = document.getElementById('ValueText');
const cardsTextElement = document.getElementById('CardsText');

async function loadfiles() {
    try {
        const responsValue = await fetch('value.txt');
        valuecontent = await responsValue.text();

        const responsCards = await fetch('cards.txt');
        cardscontent = await responsCards.text();

        updatesite();
    } catch (error) {
        console.error("Couldn't Load The value & cards files:", error);
    }
}

function updatesite() {
    if (valueTextElement) valueTextElement.innerText = valuecontent;
    if (cardsTextElement) cardsTextElement.innerText = cardscontent;
}

document.addEventListener('DOMContentLoaded', () => {
    loadfiles();
});


const dexContainer = document.getElementById('dexContainer');
const searchInput = document.getElementById('vehicleSearch');
const statsContainer = document.getElementById('rarityStats');

const fuse = new Fuse(vehicles, {
    keys: ['name', 'type', 'rarity', 'keywords'],
    threshold: 0.3
});

function sortVehicles(list) {
    return list.sort((a, b) => {
        const itemA = a.item || a;
        const itemB = b.item || b;
        const orderA = rarityOrder[itemA.rarity] || 99;
        const orderB = rarityOrder[itemB.rarity] || 99;
        return orderA - orderB;
    });
}

function getRarityCounts() {
    const counts = { Secret: 0, Custom: 0, Legendary: 0, Epic: 0, Rare: 0, Common: 0, Limited: 0 };
    vehicles.forEach(vehicle => {
        const r = vehicle.rarity;
        if (counts.hasOwnProperty(r)) counts[r]++;
    });
    return counts;
}

function updateStatsUI() {
    const counts = getRarityCounts();
    const displayOrder = ["Secret", "Custom", "Limited", "Legendary", "Epic", "Rare", "Common"];
  
    let statsHTML = displayOrder
        .filter(key => counts[key] > 0)
        .map(key => `<span class="stat-item rarity-${key.toLowerCase()}" onclick="filterByRarity('${key}')"><strong>${key}:</strong> ${counts[key]}</span>`)
        .join(' | ');

    statsContainer.innerHTML = statsHTML;
}

window.filterByRarity = function(rarity) {
    const filtered = vehicles.filter(v => v.rarity === rarity);
    displayVehicles(filtered);
    
    searchInput.value = ""; 
    
    const counts = getRarityCounts();
    const displayOrder = ["Secret", "Custom", "Limited", "Legendary", "Epic", "Rare", "Common"];
    
    let baseStats = displayOrder
        .filter(key => counts[key] > 0)
        .map(key => `<span class="stat-item rarity-${key.toLowerCase()}" onclick="filterByRarity('${key}')"><strong>${key}:</strong> ${counts[key]}</span>`)
        .join(' | ');

    statsContainer.innerHTML = `
        <button class="view-btn" style="margin:0 15px 0 0; padding: 2px 10px; background: #FFD700; color: #000;" 
        onclick="resetFilters()">Clear Filter</button> 
        <span style="margin-right: 15px; color: #888;">Filtering: <strong>${rarity}</strong></span> | ${baseStats}
    `;
}

window.resetFilters = function() {
    displayVehicles(vehicles);
    updateStatsUI();
    searchInput.value = "";
}

function displayVehicles(list) {
    dexContainer.innerHTML = '';
    const sortedList = sortVehicles([...list]);
    if (list.length === 0) {
        dexContainer.innerHTML = '<div class="no-results">No vehicles found matching your search.</div>';
        return;
    }
    sortedList.forEach(v => {
        const item = v.item || v;
        const card = document.createElement('div');
        const rarityKey = item.rarity || 'Common';
        
        card.className = `vehicle-card rarity-${rarityKey.toLowerCase()}`;
        
        if (item.cardBackground) {
            card.style.backgroundImage = `url('${item.cardBackground}')`;
            card.style.backgroundSize = 'cover';
            card.classList.add('event-card');
        }

        const keywordText = item.keywords ? item.keywords.join(', ') : 'None';

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="rarity">${rarityKey} — ${item.type}</p>
            <p class="value"><img src="medal.webp" class="medal-icon"> Value: ${rarityValues[rarityKey] || 0} Medals</p>
            <div class="keyword-overlay">
                <strong>Keywords:</strong><br>
                <span>${keywordText}</span>
            </div>
        `;

        card.onclick = () => card.classList.toggle('show-keywords');

        dexContainer.appendChild(card);
    });
}

window.viewCrateContent = function(rarities) {
    const filtered = vehicles.filter(v => rarities.includes(v.rarity));
    openTab('dex');
    displayVehicles(filtered);
    searchInput.value = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.openTab = function(tabName) {
    const dexView = document.getElementById('dexView');
    const chances = document.getElementById('chancesContent');
    const crates = document.getElementById('cratesContent');
    const collector = document.getElementById('collectorContent');
    const search = document.querySelector('.search-container');
    const buttons = document.querySelectorAll('.tab-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(`'${tabName}'`));
    if (activeBtn) activeBtn.classList.add('active');

    document.body.className = `theme-${tabName}`;

    dexView.style.display = tabName === 'dex' ? 'block' : 'none';
    search.style.display = tabName === 'dex' ? 'block' : 'none';
    chances.style.display = tabName === 'chances' ? 'block' : 'none';
    crates.style.display = tabName === 'crates' ? 'block' : 'none';
    collector.style.display = tabName === 'collector' ? 'block' : 'none';

    if (tabName === 'dex' && !dexContainer.innerHTML) {
        displayVehicles(vehicles);
    }
}

updateStatsUI();
displayVehicles(vehicles);

searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    displayVehicles(query.length > 0 ? fuse.search(query) : vehicles);
});
