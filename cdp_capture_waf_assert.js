const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const wsUri = process.argv[2];
const targetUrl = process.argv[3];
const outputPath = process.argv[4];
const pageId = wsUri.split('/').pop();

async function run() {
    const ws = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${pageId}`);
    
    ws.on('open', () => {
        ws.send(JSON.stringify({
            id: 1,
            method: 'Page.navigate',
            params: { url: targetUrl }
        }));
    });

    ws.on('message', async (data) => {
        const msg = JSON.parse(data.toString());
        
        if (msg.id === 1) {
            setTimeout(() => {
                ws.send(JSON.stringify({
                    id: 3,
                    method: 'Runtime.evaluate',
                    params: {
                        expression: 'document.body.innerText',
                        returnByValue: true
                    }
                }));
            }, 20000);
        }

        if (msg.id === 3) {
            const pageText = msg.result && msg.result.result ? msg.result.result.value : '';
            console.log("PAGE TEXT READ:", pageText.substring(0, 100).replace(/\n/g, ' '));
            
            if (pageText.includes('J2Car-WAF-ACL')) {
                ws.send(JSON.stringify({
                    id: 2,
                    method: 'Page.captureScreenshot',
                    params: { format: 'png' }
                }));
            } else {
                console.log("STATUS: KEYWORD_NOT_FOUND_YET_RETRYING");
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        id: 5,
                        method: 'Runtime.evaluate',
                        params: {
                            expression: 'document.body.innerText',
                            returnByValue: true
                        }
                    }));
                }, 5000);
            }
        }

        if (msg.id === 5) {
            const pageText = msg.result && msg.result.result ? msg.result.result.value : '';
            if (pageText.includes('J2Car-WAF-ACL')) {
                ws.send(JSON.stringify({
                    id: 2,
                    method: 'Page.captureScreenshot',
                    params: { format: 'png' }
                }));
            } else {
                console.log("STATUS: FAILED_WAF_NOT_IN_DOM");
                ws.close();
                process.exit(1);
            }
        }
        
        if (msg.id === 2) {
            if (msg.result && msg.result.data) {
                const buffer = Buffer.from(msg.result.data, 'base64');
                fs.writeFileSync(outputPath, buffer);
                console.log('STATUS: SUCCESS_CONFIRMED');
            }
            ws.close();
            process.exit(0);
        }
    });
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
