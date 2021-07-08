const Discord = require('discord.js');
const client = new Discord.Client();

console.log('discord-react-words startup');

client.once('ready', () => {
    console.log('Discord.js ready');
});

client.login('get your own token, freeloader :)');

// There are other emoji that may be used to substitute letters,
// this could allow us to display multiple of the same letter in the future
const alphabetMap = {
    'a': '🇦',
    'b': '🇧',
    'c': '🇨',
    'd': '🇩',
    'e': '🇪',
    'f': '🇫',
    'g': '🇬',
    'h': '🇭',
    'i': '🇮',
    'j': '🇯',
    'k': '🇰',
    'l': '🇱',
    'm': '🇲',
    'n': '🇳',
    'o': '🇴',
    'p': '🇵',
    'q': '🇶',
    'r': '🇷',
    's': '🇸',
    't': '🇹',
    'u': '🇺',
    'v': '🇻',
    'w': '🇼',
    'x': '🇽',
    'y': '🇾',
    'z': '🇿',
};

client.on('message', message => {
	if (message.content === 'apple') {
        message.react('🍎');
        return;
    }

    // TODO: Restructuring needed
    var isValid = isStringValidForReact(message.content);
    var reactions = [];
    if (isValid) {
        var text = message.content.toLowerCase(); // TODO: English only for now :(
        var letterCount = count(text);
        for (const elem of letterCount) {
            if (elem[1] > 1) {
                isValid = false;
            }
        }

        if (isValid) {
            for (var i = 0; i < text.length; i++) {
                reactions.push(alphabetMap[text.charAt(i)]);
            }
        }
    }

    if (isValid) {
        for (const r of reactions) {
            // ! Hacky way of getting around await-only-in-async-functions requirements
            (async function() {
                await message.react(r);
            })();
        }
    }
    else {
        message.react('❌');
    }
});

// TODO: Not sure how safe this would be with non-English
function count(string) {
    var count = new Map();
    string.split('').forEach(function(s) {
       count.get(s) ? count.set(s, count.get(s) + 1) : count.set(s, 1);
    });
    return count;
}

function isStringValidForReact(s) {
    const english = /^[A-Za-z0-9]*$/;
    return english.test(s);
}