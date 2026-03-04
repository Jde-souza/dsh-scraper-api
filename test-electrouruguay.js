import axios from 'axios';
import * as cheerio from 'cheerio';

async function testEU() {
    const query = 'cable';
    const searchUrl = `https://www.electrouruguay.com/catalogo?q=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        console.log("Extrayendo productos basados en inputs ocultos:");
        let count = 0;

        $('input[type="hidden"]').each((i, el) => {
            const val = $(el).attr('value') || '';
            // Si el JSON pertenece a Fenicio ('fen')
            if (val.includes('sku') && val.includes('fen')) {
                const card = $(el).closest('.it, .item, .caja, li');
                if (card.length > 0 && count < 3) {
                    count++;
                    console.log(`\n--- Elemento ${count} ---`);

                    const title = card.find('.title, .nom, h2, h3, h4').text().trim();
                    const price = card.find('.price, .precio').text().replace(/\s+/g, ' ').trim();
                    let img = card.find('img').attr('data-src') || card.find('img').attr('src');
                    // las imagenes de fenicio vienen por data-src
                    const link = card.find('a').attr('href');

                    console.log("Título:", title);
                    console.log("Precio USD:", price.includes('U$S') || price.includes('USD') ? price : 'NO USD');
                    console.log("Precio Total:", price);
                    console.log("Link:", link);
                    console.log("Imagen:", img);
                }
            }
        });

    } catch (error) {
        console.error('Error fetching ElectroUruguay:', error.message);
    }
}

testEU();
