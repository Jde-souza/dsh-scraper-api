import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
    try {
        const response = await axios.get('https://www.palaciodelamusica.com.uy/catalogo?q=behringer', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const products = [];

        let productLinks = $('a').filter((i, el) => {
            const href = $(el).attr('href') || '';
            // It has an img and href looks like a product link.
            return href.includes('catalogo') && $(el).find('img').length > 0 && $(el).hasClass('img');
        });

        productLinks.each((i, el) => {
            if (i >= 12) return;
            const parent = $(el).closest('.it, li');

            const title = $(el).attr('title') || parent.find('.nom, h2').text().trim();
            const link = $(el).attr('href');

            // Image is complicated, they use data-src for lazy loading sometimes
            let image = $(el).find('img').last().attr('src') || $(el).find('img').last().attr('data-src');
            if (image && String(image).startsWith('//')) {
                image = 'https:' + image;
            }

            let priceRaw = parent.find('.precio, .price').text().replace(/[\n\r]/g, '').trim();
            // Fallback if price is not inside a standard tag
            if (!priceRaw) {
                priceRaw = parent.text().match(/(U\$S|\$U?)\s*\d+([.,]\d+)?/i)?.[0] || 'Consultar';
            }

            if (title && image) {
                products.push({
                    title,
                    price: priceRaw,
                    image,
                    link
                });
            }
        });

        console.log(products.slice(0, 3));

    } catch (e) {
        console.error(e.message);
    }
}
test();
