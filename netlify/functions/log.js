exports.handler = async (event) => {
    const ip = event.headers['x-nf-client-connection-ip'] || 'unknown';
    const ua = event.headers['user-agent'] || 'unknown';
    const timestamp = new Date().toISOString();

    const message = `**New Visitor**\nIP: \`${ip}\`\nTime: ${timestamp}\nUA: ${ua}`;

    try {
        await fetch('https://discord.com/api/webhooks/1525619686434279564/4WcjQ1_nAdgsHQtMRAXaww-wPg4vOwglWFwf3oTes7DpODl7I3sG1g129Vq1xr9_UNFZ', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message })
        });
    } catch (err) {
        console.error('Webhook failed', err);
    }

    // Return a transparent 1x1 GIF so the fetch doesn't show anything
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'image/gif' },
        body: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        isBase64Encoded: true
    };
};
