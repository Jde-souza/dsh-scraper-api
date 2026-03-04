import axios from 'axios';
import * as cheerio from 'cheerio';

async function testXproStore() {
    const query = 'auricular';
    const searchUrl = `https://uy.xprostore.com/index.php?route=product/search&search=${encodeURIComponent(query)}`;

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

        // Contenedores clásicos de OpenCart
        const productsCount = $('.product-layout, .product-thumb, .item').length;
        console.log("Número de containers (.product-layout, .product-thumb):", productsCount);

        if (productsCount > 0) {
            $('.product-layout, .product-thumb').each((i, el) => {
                if (i > 2) return;
                console.log(`\n--- ARTICULO ${i} ---`);

                const title = $(el).find('h4, .name, .caption a').first().text().trim();
                const price = $(el).find('.price, .price-new').first().text().replace(/\s+/g, ' ').trim();
                const img = $(el).find('img').attr('src');
                const link = $(el).find('.image a, .caption a').first().attr('href');

                console.log("Título:", title);
                console.log("Precio:", price);
                console.log("Imagen:", img);
                console.log("Link:", link);

                if (i === 0) console.log("HTML:", $(el).html()?.substring(0, 400).replace(/\s+/g, ' '));
            });
        } else {
            console.log("No detecté productos con las clases de OpenCart. Viendo el HTML del contenedor main:");
            console.log($('#content, main, .main-content').html()?.substring(0, 1000).replace(/\s+/g, ' '));
        }

    } catch (error) {
        console.error('Error fetching XproStore:', error.message);
    }
}

testXproStore();
