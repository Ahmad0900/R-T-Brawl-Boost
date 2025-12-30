const keepAlive = require('./keep_alive');
require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

const DISBOARD_BOT_ID = '302050872383242240';
const USER_TOKEN = process.env.USER_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// --- STEALTH CONFIGURATION ---
// This tricks Discord into thinking we are a real Windows PC
const client = new Client({
    checkUpdate: false,
    patchVoice: true, 
    ws: {
        properties: {
            os: 'Windows',
            browser: 'Discord Client',
            release_channel: 'stable',
            client_version: '1.0.9010',
            os_version: '10.0.22621',
            os_arch: 'x64',
            system_locale: 'en-US',
            window_manager: 'unknown',
            distro: 'unknown'
        }
    }
});

client.on('ready', async () => {
    console.log(`✅ SUCCESS: Logged in as ${client.user.tag}`);
    bumpingTask(); 
});

client.on('debug', (info) => {
    // Log connection progress to help us debug
    if(info.includes('Session') || info.includes('token') || info.includes('Login') || info.includes('Gateway')) {
        console.log(`[DEBUG]: ${info}`);
    }
});

async function bumpingTask() {
    console.log('🔄 Starting bumping cycle...');
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel) {
            console.error(`❌ FATAL: Could not find channel ${CHANNEL_ID}`);
            return;
        }

        await channel.sendSlash(DISBOARD_BOT_ID, 'bump');
        console.log(`✅ SENT: /bump command to #${channel.name}`);

    } catch (error) {
        console.error('⚠️ ERROR during bump:', error.message);
    } finally {
        const randomDelay = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
        const totalWait = 7200 + randomDelay;
        const minutes = (totalWait / 60).toFixed(2);
        console.log(`⏳ Sleeping for ${minutes} minutes...`);
        setTimeout(bumpingTask, totalWait * 1000);
    }
}

keepAlive();
client.login(USER_TOKEN);
