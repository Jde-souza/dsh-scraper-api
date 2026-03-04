import axios from 'axios';
import * as cheerio from 'cheerio';

async function testLucesPro() {
    const query = 'auricular';
    const searchUrl = `https://www.lucespro.com/?s=${encodeURIComponent(query)}&post_type=product`;

    console.log(`Buscando en: ${searchUrl}`);

    try {
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        });

        console.log('Respuesta recibida. Status:', response.status);
        const html = response.data;
        const $ = cheerio.load(html);

        console.log("Título de la página:", $('title').text());

        const productsCount = $('li.product, .product, .product-small').length;
        console.log("Número de divs con clase product:", productsCount);

        if (productsCount > 0) {
            $('li.product, .product, .product-small').each((i, el) => {
                if (i > 3) return; // limit

                console.log(`\n--- ARTICULO ${i} ---`);
                const title = $(el).find('.woocommerce-loop-product__title, h2, h3, .product-title').text().trim();
                const price = $(el).find('.price, .woocommerce-Price-amount').text().replace(/\s+/g, ' ').trim();
                let img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
                if (img && img.includes('data:image')) {
                    img = $(el).find('img').attr('data-lazy-src') || img;
                }
                const link = $(el).find('a').attr('href');

                console.log("Título:", title);
                console.log("Precio:", price);
                console.log("Imagen:", img);
                console.log("Link:", link);

                if (i === 0) console.log("HTML corto:", $(el).html().substring(0, 500).replace(/\s+/g, ' '));
            });
        }
    } catch (error) {
        console.error('Error fetching LucesPro:', error.message);
    }
}

testLucesPro();
