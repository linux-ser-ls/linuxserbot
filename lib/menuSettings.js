const fs = require('fs');
const path = require('path');

const settingsFile = path.join(__dirname, 'menuSettings.json');

function getMenu() {
    try {
        const data = JSON.parse(fs.readFileSync(settingsFile));
        return data.currentMenu || 'menu1';
    } catch {
        return 'menu1';
    }
}

function setMenu(menu) {
    fs.writeFileSync(
        settingsFile,
        JSON.stringify({ currentMenu: menu }, null, 2)
    );
}

module.exports = {
    getMenu,
    setMenu
};
