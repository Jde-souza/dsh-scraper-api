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
        // Buscamos en Palacio de la Música (Ejemplo de URL)
        const searchUrl = `https://www.palaciodelamusica.com.uy/catalogo?q=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = [];

        // Usamos los selectores reales que funcionan en el HTML actual
        let productLinks = $('a').filter((i, el) => {
            const href = $(el).attr('href') || '';
            return href.includes('catalogo') && $(el).find('img').length > 0 && $(el).hasClass('img');
        });

        productLinks.each((index, el) => {
            if (index >= 12) return;
            const parent = $(el).closest('.it, li');

            const title = $(el).attr('title') || parent.find('.nom, h2').text().trim();
            const link = $(el).attr('href');

            let image = $(el).find('img').last().attr('src') || $(el).find('img').last().attr('data-src') || '';
            if (image && String(image).startsWith('//')) {
                image = 'https:' + image;
            }

            let priceRaw = parent.find('.precio, .price').text().replace(/[\n\r]/g, '').trim();
            if (!priceRaw) {
                priceRaw = parent.text().match(/(U\$S|\$U?)\s*\d+([.,]\d+)?/i)?.[0] || 'Consultar';
            }

            // A veces traen el precio rebajado y el original pegados, ej "USD 202,50USD 225,00"
            // Intentar separarlos y quedarnos con el menor si es el caso
            if (priceRaw.includes('USD') && priceRaw.indexOf('USD') !== priceRaw.lastIndexOf('USD')) {
                const parts = priceRaw.split('USD').filter(p => p.trim());
                if (parts.length >= 2) {
                    priceRaw = 'USD ' + parts[0].trim();
                }
            } else if (priceRaw.includes('$') && priceRaw.indexOf('$') !== priceRaw.lastIndexOf('$')) {
                const parts = priceRaw.split('$').filter(p => p.trim());
                if (parts.length >= 2) {
                    priceRaw = '$ ' + parts[0].trim();
                }
            }

            if (title && image) {
                products.push({
                    id: `palacio_${Date.now()}_${index}`,
                    provider: 'Palacio de la Música',
                    title,
                    price: priceRaw,
                    image,
                    link
                });
            }
        });

        res.json(products);

    } catch (error) {
        console.error('Error scraping Palacio de la Música:', error.message);
        res.status(500).json({ error: 'Error al obtener datos del proveedor', details: error.message });
    }
});

export default router;
