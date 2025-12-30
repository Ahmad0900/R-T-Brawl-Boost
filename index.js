const keepAlive = require('./keep_alive');
require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

const DISBOARD_BOT_ID = '302050872383242240';
const USER_TOKEN = process.env.USER_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// Configure the client to be stealthy and fast
const client = new Client({
    checkUpdate: false,
    patchVoice: true, // often helps with login stability
    syncStatus: false
});

// 1. LISTEN FOR SUCCESS
client.on('ready', async () => {
    console.log(`✅ SUCCESS: Logged in as ${client.user.tag}`);
    bumpingTask(); 
});

// 2. LISTEN FOR DEEP DEBUG LOGS (This fixes the silence)
client.on('debug', (info) => {
    // Only print important connection info, ignore the noise
    if(info.includes('Session') || info.includes('token') || info.includes('Login')) {
        console.log(`[DEBUG]: ${info}`);
    }
});

// 3. LISTEN FOR RAW ERRORS
client.on('error', (error) => {
    console.error('❌ CLIENT ERROR:', error);
});

async function bumpingTask() {
    console.log('🔄 Starting bumping cycle...');
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel) {
            console.error(`❌ FATAL: Could not find channel ${CHANNEL_ID}`);
            return;
        }

        // Use the library's built-in Slash Command spoofer
        await channel.sendSlash(DISBOARD_BOT_ID, 'bump');
        console.log(`✅ SENT: /bump command to #${channel.name}`);

    } catch (error) {
        console.error('⚠️ ERROR during bump:', error.message);
        if(error.message.includes("could not find")) {
             console.error("   -> Hint: Is Disboard actually in this channel?");
        }
    } finally {
        const randomDelay = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
        const totalWait = 7200 + randomDelay;
        const minutes = (totalWait / 60).toFixed(2);
        console.log(`⏳ Sleeping for ${minutes} minutes...`);
        setTimeout(bumpingTask, totalWait * 1000);
    }
}

keepAlive();

console.log("🚀 Attempting to log in...");
client.login(USER_TOKEN).catch(err => {
    console.error("❌ LOGIN FAILED HARD:", err);
});
