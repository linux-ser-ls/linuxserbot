const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, './data/menuSettings.json');

if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}));
}

function getData() {
    return JSON.parse(fs.readFileSync(FILE));
}

function saveData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function setMenu(chatId, menu) {
    const data = getData();
    data[chatId] = menu;
    saveData(data);
}

function getMenu(chatId) {
    const data = getData();
    return data[chatId] || 'menu1';
}

module.exports = {
    setMenu,
    getMenu
};
