import axios from 'axios';
import * as cheerio from 'cheerio';

async function testFivisa() {
    const url = `https://www.fivisa.com.uy/`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        console.log("Formularios en HOME:");
        $('form').each((i, el) => {
            const action = $(el).attr('action') || 'N/A';
            const method = $(el).attr('method') || 'GET';
            console.log(`\nFORM ${i}:`);
            console.log("Action:", action);
            console.log("Method:", method);
            console.log("Inputs name:", $(el).find('input').map((i, input) => $(input).attr('name')).get());
        });

        console.log("\nApariciones de JS eCommerce:");
        console.log("vtex:", html.includes('vtex'));
        console.log("tiendanube:", html.includes('tiendanube'));
        console.log("fcdn:", html.includes('fcdn'));

    } catch (error) {
        console.error('Error fetching Fivisa:', error.message);
    }
}

testFivisa();
