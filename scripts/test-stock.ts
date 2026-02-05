
import { getQuote, getChartData } from '../api/_lib/yahoo-finance.js';

async function test() {
    console.log('\n--- STARTED TEST ---');
    const symbol = 'NVDA';

    try {
        console.log(`\n1. FetchingQUOTE for ${symbol}...`);
        const quote = await getQuote(symbol);
        if (!quote) {
            console.log('Quote is NULL');
        } else {
            console.log('Quote Data:');
            console.log(`- Price: ${quote.price}`); // Check this specifically
            console.log(`- DayHigh: ${quote.dayHigh}`);
            console.log(`- DayLow: ${quote.dayLow}`);
            console.log(`- Change: ${quote.change}`);
        }

        console.log(`\n2. Fetching CHART for ${symbol}...`);
        const chart = await getChartData(symbol, '1mo');
        console.log(`Chart Points: ${chart.length}`);
        if (chart.length > 0) {
            const last = chart[chart.length - 1];
            console.log(`- Last point Close: ${last.close}`);
            console.log(`- Last point High: ${last.high}`);
            console.log(`- Last point Value: ${last.value}`); // Added check
        }
    } catch (error) {
        console.error('Test CRASHED:', error);
    }
    console.log('\n--- END TEST ---');
}

test();
