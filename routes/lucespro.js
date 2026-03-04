import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/search', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda (q)' });
    }

    try {
        const searchUrl = `https://www.lucespro.com/?s=${encodeURIComponent(q)}&post_type=product`;
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = [];

        // Selectores basados en WooCommerce modificado de LucesPro
        $('li.product, .product').each((index, element) => {
            const title = $(element).find('.woocommerce-loop-product__title, h2, h3, .product-title').text().trim();

            // LucesPro suele concatenar USD sin espacio y duplicarlo: "USD60.00USD60.00"
            let priceRaw = $(element).find('.price, .woocommerce-Price-amount').text().trim().replace(/[\n\r]/g, ' ').replace(/\s\s+/g, ' ');
            if (priceRaw.includes('USD') && priceRaw.indexOf('USD') !== priceRaw.lastIndexOf('USD')) {
                const parts = priceRaw.split('USD').filter(p => p.trim());
                if (parts.length >= 2) { priceRaw = 'USD ' + parts[0].trim(); }
            } else if (priceRaw.includes('USD')) {
                priceRaw = priceRaw.replace('USD', 'USD ');
            }

            let image = $(element).find('img').attr('src') || '';
            if (image && image.includes('data:image')) {
                image = $(element).find('img').attr('data-lazy-src') || image;
            }

            const linkElement = $(element).find('a.woocommerce-LoopProduct-link, a').first();
            const link = linkElement.attr('href') || '';

            if (title && priceRaw && !priceRaw.toLowerCase().includes('consultar')) {
                products.push({
                    id: `lucespro_${Date.now()}_${index}`,
                    provider: 'Luces Pro',
                    title,
                    price: priceRaw,
                    image,
                    link
                });
            }
        });

        res.json(products);

    } catch (error) {
        console.error('Error scraping LucesPro:', error.message);
        res.status(500).json({ error: 'Error al obtener datos del proveedor', details: error.message });
    }
});

export default router;
