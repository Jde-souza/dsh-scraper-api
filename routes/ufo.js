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
        // Buscamos en Sistema UFO (Ejemplo de URL)
        const searchUrl = `https://sistemaufo.com.uy/?s=${encodeURIComponent(q)}&post_type=product`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = [];

        // Selectores para WooCommerce clásico (usado típicamente por Sistema UFO)
        $('li.product, .product').each((index, element) => {
            // Limitar resultados
            if (index >= 12) return;

            const title = $(element).find('.woocommerce-loop-product__title, h2').text().trim();

            let priceRaw = $(element).find('.price').text().trim();
            // Limpiar precio (WooCommerce a veces pone precio viejo tachado junto al nuevo)
            priceRaw = priceRaw.replace(/[\n\r]/g, ' ').replace(/\s\s+/g, ' ').trim();

            const imgElement = $(element).find('img');
            const image = imgElement.attr('src') || imgElement.attr('data-src') || '';

            const linkElement = $(element).find('a.woocommerce-LoopProduct-link, a');
            const link = linkElement.attr('href') || '';

            if (title && priceRaw) {
                products.push({
                    id: `ufo_${Date.now()}_${index}`,
                    provider: 'Sistema UFO',
                    title,
                    price: priceRaw,
                    image,
                    link
                });
            }
        });

        res.json(products);

    } catch (error) {
        console.error('Error scraping Sistema UFO:', error.message);
        res.status(500).json({ error: 'Error al obtener datos del proveedor', details: error.message });
    }
});

export default router;
