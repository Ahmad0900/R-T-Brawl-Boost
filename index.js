// This new function is the key to keeping the bot alive 24/7
const keepAlive = require('./keep_alive');

require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const DISBOARD_BOT_ID = '302050872383242240';

// --- Configuration from Secrets ---
const USER_TOKEN = process.env.USER_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
    checkUpdate: false,
});

client.on('ready', async () => {
    console.log(`--- Logged in as user: ${client.user.tag} ---`);
    console.log('--- WARNING: Self-botting is against Discord ToS and can get your account banned. ---');
    bumpingTask(); 
});

async function bumpingTask() {
    console.log('Starting bumping cycle...');
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel) {
            console.error(`FATAL ERROR: Could not find channel with ID ${CHANNEL_ID}.`);
            return;
        }
        await channel.sendSlash(DISBOARD_BOT_ID, 'bump');
        console.log(`Successfully sent /bump command to #${channel.name}.`);

    } catch (error) {
        console.error('An error occurred during bump:', error.message);
    } finally {
        const randomDelay = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
        const totalWait = 7200 + randomDelay;
        const minutes = (totalWait / 60).toFixed(2);
        console.log(`Next bump in ${minutes} minutes. Sleeping...`);
        setTimeout(bumpingTask, totalWait * 1000);
    }
}

// This line starts the web server
keepAlive();

// This line logs the bot in
client.login(USER_TOKEN).catch(err => {
    console.error("FATAL ERROR: Failed to login. Is your USER_TOKEN correct in the Secrets?");
    console.error(err.message);
});
