require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { ProxyAgent } = require('proxy-agent');

const DISBOARD_BOT_ID = '302050872383242240';
const USER_TOKEN = process.env.USER_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PROXY_URL = process.env.PROXY_URL;

// --- DELAY CONFIGURATION (SAFE LIMIT) ---
// Min: 1 Minute (60,000 ms)
// Max: 7 Minutes (420,000 ms)
const MIN_DELAY = 60000; 
const MAX_DELAY = 420000; 

// Calculate random wait
const randomWaitTime = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
const waitInMinutes = (randomWaitTime / 60000).toFixed(2);

console.log(`⏳ GitHub Action started.`);
console.log(`⏱️ Calculated Delay: ${waitInMinutes} minutes.`);
console.log(`...Waiting...`);

// Wait first, THEN run the bot
setTimeout(() => {
    startBot();
}, randomWaitTime);

function startBot() {
    console.log("🚀 Timer finished. Starting Bot Process now...");
    
    const clientOptions = {
        checkUpdate: false,
        patchVoice: false,
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
    };

    if (PROXY_URL) {
        console.log(`🌐 Connecting via Proxy...`);
        const agent = new ProxyAgent(PROXY_URL);
        clientOptions.http = { agent: agent };
        clientOptions.ws.agent = agent;
    }

    const client = new Client(clientOptions);

    client.on('ready', async () => {
        console.log(`✅ Logged in as ${client.user.tag}`);
        
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel) {
                console.error(`❌ FATAL: Channel not found.`);
                process.exit(1);
            }

            console.log("📤 Sending /bump command...");
            await channel.sendSlash(DISBOARD_BOT_ID, 'bump');
            console.log(`✅ SUCCESS: Bump sent!`);
            
            setTimeout(() => {
                console.log("👋 Job finished. Exiting.");
                process.exit(0);
            }, 10000);

        } catch (error) {
            console.error('⚠️ ERROR:', error.message);
            process.exit(1);
        }
    });

    client.on('error', (err) => {
        console.error("Client Error:", err);
    });

    client.login(USER_TOKEN).catch(err => {
        console.error("❌ Login Failed:", err);
        process.exit(1);
    });
}
