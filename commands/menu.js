const { getMenu } = require('./data/menuSettings');

const menu1Command = require('./menu1');
const menu2Command = require('./menu2');

async function menuCommand(sock, chatId, message) {

    const selectedMenu = getMenu(chatId);

    if (selectedMenu === 'menu2') {
        return await menu2Command(sock, chatId, message);
    }

    return await menu1Command(sock, chatId, message);
}

module.exports = menuCommand;
