const keepAlive = require('./keep_alive');
require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { ProxyAgent } = require('proxy-agent');
const https = require('https');

const DISBOARD_BOT_ID = '302050872383242240';
const USER_TOKEN = process.env.USER_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PROXY_URL = process.env.PROXY_URL;

// --- STEP 1: TEST THE PROXY ---
function checkProxy() {
    return new Promise((resolve, reject) => {
        if (!PROXY_URL) {
            console.log('⚠️ No Proxy URL provided. Skipping proxy test.');
            return resolve(null);
        }

        console.log('🌐 Testing Proxy connection...');
        const agent = new ProxyAgent(PROXY_URL);
        
        const options = {
            host: 'api.ipify.org',
            port: 443,
            path: '/',
            agent: agent
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`✅ PROXY WORKING! Outgoing IP: ${data.trim()}`);
                resolve(agent);
            });
        }).on('error', (err) => {
            console.error(`❌ PROXY FAILED: Could not connect through proxy.`);
            console.error(`   Error: ${err.message}`);
            console.error(`   Make sure your Webshare username/password are correct.`);
            reject(err);
        });
    });
}

// --- STEP 2: START THE BOT ---
async function startBot(agent) {
    const clientOptions = {
        checkUpdate: false,
        patchVoice: false, // <--- CHANGED: Set to false to prevent freezing on Render
        syncStatus: false,
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

    if (agent) {
        clientOptions.http = { agent: agent };
        clientOptions.ws.agent = agent;
    }

    const client = new Client(clientOptions);

    client.on('ready', async () => {
        console.log(`✅ SUCCESS: Logged in as ${client.user.tag}`);
        bumpingTask(client);
    });

    client.on('debug', (info) => {
        if(info.includes('Session') || info.includes('token') || info.includes('Login') || info.includes('Gateway')) {
            console.log(`[DEBUG]: ${info}`);
        }
    });

    console.log("🚀 Attempting Discord Login...");
    client.login(USER_TOKEN).catch(err => {
        console.error("❌ LOGIN FAILED:", err);
    });
}

async function bumpingTask(client) {
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
        setTimeout(() => bumpingTask(client), totalWait * 1000);
    }
}

// Run the sequence
keepAlive();
checkProxy().then((agent) => {
    startBot(agent);
}).catch(() => {
    console.log("🛑 Bot stopped due to proxy error.");
});
