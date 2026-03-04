import axios from 'axios';
import * as cheerio from 'cheerio';

async function testLidertek() {
    const query = 'auricular';
    const searchUrl = `https://lidertek.uy/?s=${encodeURIComponent(query)}&post_type=product`;

    console.log(`Buscando en: ${searchUrl}`);

    try {
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Referer': 'https://www.google.com/',
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        console.log('Respuesta recibida. Status:', response.status);
        const html = response.data;
        const $ = cheerio.load(html);

        console.log("Título de la página:", $('title').text());

        const productsCount = $('li.product, .product').length;
        console.log("Número de divs con clase product:", productsCount);

        if (productsCount > 0) {
            $('li.product, .product').each((i, el) => {
                if (i > 3) return; // limit

                console.log(`\n--- ARTICULO ${i} ---`);
                const title = $(el).find('.woocommerce-loop-product__title, h2, h3, .product-title').text().trim();
                const price = $(el).find('.price, .woocommerce-Price-amount').text().replace(/\s+/g, ' ').trim();
                const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
                const link = $(el).find('a').attr('href');

                console.log("Título:", title);
                console.log("Precio:", price);
                console.log("Imagen:", img);
                console.log("Link:", link);
            });
        } else {
            console.log("No se encontraron productos clásicos de WooCommerce.");
            // Log de prueba
            console.log($('body').html()?.substring(0, 1000).replace(/\s+/g, ' '));
        }

    } catch (error) {
        console.error('Error fetching Lidertek:', error.message);
    }
}

testLidertek();
