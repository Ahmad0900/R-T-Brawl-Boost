const keepAlive = require('./keep_alive');
require('dotenv').config();
const { Client } = require('discord.js-self');

const DISBOARD_BOT_ID = '302050872383242240';

// --- Configuration from Secrets ---
const USER_TOKEN = process.env.USER_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client();

client.on('ready', async () => {
    console.log(`--- Logged in successfully as user: ${client.user.tag} ---`);
    console.log('--- WARNING: Self-botting is against Discord ToS and can get your account banned. ---');
    
    // Start the main bumping loop
    bumpingTask();
});

async function bumpingTask() {
    console.log('Starting bumping cycle...');
    try {
        const channel = await client.channels.cache.get(CHANNEL_ID);
        if (!channel) {
            console.error(`FATAL ERROR: Could not find channel with ID ${CHANNEL_ID}.`);
            return;
        }

        // This new method is more reliable: it finds the command ID first
        const commands = await channel.guild.commands.fetch();
        const bumpCommand = commands.find(cmd => cmd.name === 'bump' && cmd.applicationId === DISBOARD_BOT_ID);

        if (bumpCommand) {
            // Now we execute the command using its found ID
            await client.managers.interactions.run(bumpCommand.id, {
                channel: channel,
                guild: channel.guild
            });
            console.log(`Successfully sent /bump command to #${channel.name}.`);
        } else {
             console.error(`ERROR: Could not find the /bump slash command for Disboard in this server.`);
        }

    } catch (error) {
        console.error('An error occurred during bump:', error);
    } finally {
        // Calculate the random wait time
        const randomDelay = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
        const totalWait = 7200 + randomDelay;
        const minutes = (totalWait / 60).toFixed(2);

        console.log(`Next bump in ${minutes} minutes. Sleeping...`);
        
        // Wait for the calculated time and then run the function again
        setTimeout(bumpingTask, totalWait * 1000);
    }
}

// Start the keep-alive server
keepAlive();

// Login using the token
client.login(USER_TOKEN);
