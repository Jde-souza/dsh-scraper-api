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
        // En tiendas basadas en OpenCart / Venta regional como XproStore
        const searchUrl = `https://uy.xprostore.com/index.php?route=product/search&search=${encodeURIComponent(q)}`;
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

        // Selectores de OpenCart
        $('.product-layout, .product-thumb').each((index, element) => {
            const titleElement = $(element).find('.name a, h4 a').first();
            const title = titleElement.text().trim();
            const link = titleElement.attr('href') || '';

            let priceRaw = $(element).find('.price, .price-new').first().text().trim().replace(/[\n\r]/g, ' ').replace(/\s\s+/g, ' ');

            // XproStore devuelve precios tipo "85.00u$s 129.00u$s" o "29.00u$s"
            if (priceRaw.toLowerCase().includes('u$s')) {
                const parts = priceRaw.toLowerCase().split('u$s').filter(p => p.trim());
                if (parts.length > 0) {
                    priceRaw = 'USD ' + parts[0].trim();
                }
            } else if (priceRaw.includes('US$')) {
                const parts = priceRaw.split('US$').filter(p => p.trim());
                if (parts.length > 0) {
                    priceRaw = 'USD ' + parts[0].trim();
                }
            } else if (priceRaw.includes('$')) {
                const parts = priceRaw.split('$').filter(p => p.trim());
                if (parts.length > 0) {
                    priceRaw = '$ ' + parts[0].trim();
                }
            }

            const image = $(element).find('.image img').first().attr('src') || '';

            if (title && priceRaw && !priceRaw.toLowerCase().includes('consultar')) {
                // Hay veces que cargan dos contenedores iguales en list y grid view
                const exists = products.find(p => p.link === link);
                if (!exists) {
                    products.push({
                        id: `xpro_${Date.now()}_${index}`,
                        provider: 'XproStore',
                        title,
                        price: priceRaw,
                        image,
                        link
                    });
                }
            }
        });

        res.json(products);

    } catch (error) {
        console.error('Error scraping XproStore:', error.message);
        res.status(500).json({ error: 'Error al obtener datos del proveedor', details: error.message });
    }
});

export default router;
