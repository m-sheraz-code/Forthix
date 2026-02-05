import https from 'https';
import yahooFinance from 'yahoo-finance2';

async function rawFetch(url, asText = false) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        };

        const req = https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(asText ? data : JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
                }
            });
        });
        req.on('error', (err) => reject(err));
    });
}

async function testSymbol(symbol, range = '1d', interval = '5m') {
    console.log(`\n--- Testing ${symbol} (range: ${range}, interval: ${interval}) ---`);

    // Method 1: yahoo-finance2
    try {
        console.log('Method 1 (yahoo-finance2): Fetching...');
        const result = await yahooFinance.chart(symbol, { range, interval });
        console.log(`Method 1 Success: ${result.quotes.length} points`);
    } catch (e) {
        console.warn(`Method 1 Failed: ${e.message}`);
    }

    // Method 2: rawFetch (Resilient)
    try {
        console.log('Method 2 (rawFetch): Fetching...');
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
        const result = await rawFetch(url);
        const chartResult = result?.chart?.result?.[0];
        if (chartResult && chartResult.timestamp) {
            console.log(`Method 2 Success: ${chartResult.timestamp.length} points`);
        } else {
            console.log('Method 2 returned no points');
            console.log('Full result keys:', Object.keys(result?.chart?.result?.[0] || {}));
        }
    } catch (e) {
        console.error(`Method 2 Failed: ${e.message}`);
    }
}

async function testQuote(symbol) {
    console.log(`\n--- Testing Quote for ${symbol} ---`);
    try {
        console.log('Fetching quote via yahoo-finance2...');
        const result = await yahooFinance.quote(symbol);
        console.log(`Success: ${result.symbol} price: ${result.regularMarketPrice}`);
    } catch (e) {
        console.warn(`yahoo-finance2 quote failed: ${e.message}`);

        // Test raw quote fetch (v7/v8)
        try {
            console.log('Testing raw chart-based quote fetch...');
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
            const result = await rawFetch(url);
            const meta = result?.chart?.result?.[0]?.meta;
            if (meta) {
                console.log(`Raw Success: ${meta.symbol} price: ${meta.regularMarketPrice}`);
            } else {
                console.log('Raw quote fetch returned no meta');
            }
        } catch (rawE) {
            console.error(`Raw quote fetch failed: ${rawE.message}`);
        }
    }
}

async function run() {
    await testQuote('NVDA');
    await testQuote('AAPL');
    await testSymbol('NVDA', '1d', '5m');
    await testSymbol('NVDA', '1mo', '1h');
}

run();
