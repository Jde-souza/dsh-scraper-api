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
        // Asumiendo búsqueda estándar de WooCommerce o Shopify
        const searchUrl = `https://lidertek.uy/?s=${encodeURIComponent(q)}&post_type=product`;
        const response = await axios.get(searchUrl, {
            timeout: 15000,
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

        const html = response.data;
        const $ = cheerio.load(html);
        const products = [];

        // Selectores de WooCommerce genéricos
        $('li.product, .product').each((index, element) => {
            const title = $(element).find('.woocommerce-loop-product__title, h2, .product-title').text().trim();

            // Lidertek duplica a veces el precio por descuentos ("U$S 72,00U$S 72,00")
            let priceRaw = $(element).find('.price').text().trim().replace(/[\n\r]/g, ' ').replace(/\s\s+/g, ' ');
            if (priceRaw.includes('U$S') && priceRaw.indexOf('U$S') !== priceRaw.lastIndexOf('U$S')) {
                const parts = priceRaw.split('U$S').filter(p => p.trim());
                if (parts.length >= 2) { priceRaw = 'U$S ' + parts[0].trim(); }
            } else if (priceRaw.includes('$') && priceRaw.indexOf('$') !== priceRaw.lastIndexOf('$')) {
                const parts = priceRaw.split('$').filter(p => p.trim());
                if (parts.length >= 2) { priceRaw = '$ ' + parts[0].trim(); }
            }
            const imgElement = $(element).find('img');
            const image = imgElement.attr('src') || imgElement.attr('data-src') || '';
            const linkElement = $(element).find('a.woocommerce-LoopProduct-link, a');
            const link = linkElement.attr('href') || '';

            if (title && priceRaw) {
                products.push({
                    id: `lidertek_${Date.now()}_${index}`,
                    provider: 'Lidertek',
                    title,
                    price: priceRaw,
                    image,
                    link
                });
            }
        });

        res.json(products);

    } catch (error) {
        console.error('Error scraping Lidertek:', error.message);
        res.status(500).json({ error: 'Error al obtener datos del proveedor', details: error.message });
    }
});

export default router;
