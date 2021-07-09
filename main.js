require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

console.log('discord-react-words startup');

client.once('ready', () => {
    console.log('Discord.js ready');
});

if (process.env.TOKEN) {
    client.login(process.env.TOKEN);
}
else {
    console.log('TOKEN needs to be provided in environment variable');
    process.exit(1);
}

// There are other emoji that may be used to substitute letters,
// this could allow us to display multiple of the same letter in the future
const alphabetMap = new Map([
    ['a', '🇦'],
    ['b', '🇧'],
    ['c', '🇨'],
    ['d', '🇩'],
    ['e', '🇪'],
    ['f', '🇫'],
    ['g', '🇬'],
    ['h', '🇭'],
    ['i', '🇮'],
    ['j', '🇯'],
    ['k', '🇰'],
    ['l', '🇱'],
    ['m', '🇲'],
    ['n', '🇳'],
    ['o', '🇴'],
    ['p', '🇵'],
    ['q', '🇶'],
    ['r', '🇷'],
    ['s', '🇸'],
    ['t', '🇹'],
    ['u', '🇺'],
    ['v', '🇻'],
    ['w', '🇼'],
    ['x', '🇽'],
    ['y', '🇾'],
    ['z', '🇿'],
]);

client.on('message', async (message) => {
    var reactions = tryConvertToReactions(message.content);

    if (reactions) {
        for (const r of reactions) {
            await message.react(r);
        }
    }
    else {
        await message.react('❌');
    }
});

function tryConvertToReactions(inText) {
    var text = inText.toLowerCase(); // TODO: English only for now :(

    // Check text to ensure:
    // 1. Each letter is in our alphabet
    // 2. Each letter only shows up once
    var letterCount = count(text);
    for (const elem of letterCount) {
        if (!alphabetMap.has(elem[0]) || elem[1] > 1) {
            return null;
        }
    }

    var reactions = [];
    for (var i = 0; i < text.length; i++) {
        reactions.push(alphabetMap.get(text.charAt(i)));
    }

    return reactions;
}

// TODO: Not sure how safe this would be with non-English
function count(string) {
    var count = new Map();
    string.split('').forEach(function(s) {
       count.get(s) ? count.set(s, count.get(s) + 1) : count.set(s, 1);
    });
    return count;
}
