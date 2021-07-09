require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

console.log('discord-react-words startup');

const commandData = {
    name: 'react',
    description: 'Spells the given text with reaction emojis',
    options: [{
        name: 'input',
        type: 'STRING',
        description: 'Text to be printed with reaction',
        required: true,
    }
    // TODO: Accept message ID or relative message index to react to
    ]
};

client.once('ready', async () => {
    console.log('Discord.js client ready');

    client.application.commands.create(commandData);
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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    if (interaction.commandName !== 'react') {
        interaction.reply({ content: 'Unknown command', ephemeral: true });
        return;
    }

    let reactions = tryConvertToReactions(interaction.options.get('input').value);
    let message = (await interaction.channel.messages.fetch({ limit: 1 }))?.last();
    if (message && reactions) {
        interaction.reply({ content: "Reactions on the way!", ephemeral: true });

        for (const r of reactions) {
            await message.react(r);
        }
    }
    else {
        interaction.reply({ content: "Failed to react to last message", ephemeral: true });
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
