require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
const alphabetMap = require('./alphabet.js');

const REACT_MESSAGE_MAX_LENGTH = 20; // Maximum reactions allowed by Discord

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
    client.user.setActivity('/react', { type: 'LISTENING' });
});

if (process.env.TOKEN) {
    client.login(process.env.TOKEN);
}
else {
    console.log('TOKEN needs to be provided in environment variable');
    process.exit(1);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        console.log('Received interaction that was not a command');
        return;
    }

    if (interaction.commandName !== 'react') {
        interaction.reply({ content: 'Unknown command', ephemeral: true });
        console.log('Received interaction with invalid command name: '+interaction.commandName);
        return;
    }

    let input = interaction.options.get('input').value; // Required, so should not be null

    console.log('Received /react interaction with input: '+input);

    let reactions = tryConvertToReactions(input);
    let message = (await interaction.channel?.messages?.fetch({ limit: 1 }))?.last(); // Grab the last message in the channel
    if (message && reactions) {
        interaction.reply({ content: 'Reactions on the way!', ephemeral: true });

        console.log('Emoji conversion and message fetch successful: '+reactions);
        console.log('Starting to add reactions');

        for (const r of reactions) {
            var err = false;
            await message.react(r).catch((reason) => {
                err = true;
            });

            if (err) {
                console.log('Error while adding reactions');
                break;
            }
        }

        console.log('Finished adding reactions');
    }
    else {
        let reason = 'Unknown reason';
        if (!reactions) {
            reason = 'Could not convert input to emoji';
        }
        else if (!message) {
            reason = 'Could not fetch previous message';
        }

        console.log('Failed reaction: '+reason);
        interaction.reply({ content: 'Failed to react: '+reason, ephemeral: true });
    }
});

function tryConvertToReactions(inText) {
    // TODO: Unicode normalizing
    if (inText.length > REACT_MESSAGE_MAX_LENGTH) {
        return null;
    }

    var text = inText.toLowerCase(); // TODO: English only for now :(

    // Check text to ensure:
    // 1. Each letter is in our alphabet
    // 2. We have enough of each character in the alphabet
    var letterCount = countCharacters(text);
    for (const elem of letterCount) {
        let char = elem[0];
        let charCount = elem[1];
        if (!alphabetMap.has(char) || alphabetMap.get(char).length < charCount) {
            return null;
        }
    }

    var reactions = [];
    var alphabetIndexMap = new Map(); // Keep track of the number of each letter used, so we can iterate over the options for each
    for (var i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        let charIndex = alphabetIndexMap.get(char) ?? 0;

        reactions.push(alphabetMap.get(char)[charIndex]);

        // Increment the amount of the letter, or initialize to 1
        alphabetIndexMap.set(char, (alphabetIndexMap.get(char) ?? 0) + 1);
    }

    return reactions;
}

// TODO: Not sure how safe this would be with non-English
function countCharacters(string) {
    var count = new Map();
    string.split('').forEach(function(s) {
        count.set(s, (count.get(s) ?? 0) + 1);
    });
    return count;
}
