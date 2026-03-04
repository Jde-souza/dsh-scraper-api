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
        // Tiendas Fenicio eCommerce / fcdn
        const searchUrl = `https://www.fivisa.com.uy/catalogo?q=${encodeURIComponent(q)}`;
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

        // Selectores enfocados al DOM de Fenicio
        $('input[type="hidden"]').each((index, el) => {
            const val = $(el).attr('value') || '';
            if (val.includes('sku') && val.includes('fen')) {
                const card = $(el).closest('.it, .item, .caja, li');
                if (card.length > 0) {
                    const title = card.find('.title, .nom, h2, h3, h4').text().trim();
                    let priceRaw = card.find('.price, .precio').text().replace(/\s+/g, ' ').trim();

                    // Limpieza de moneda
                    let image = card.find('img').attr('data-src') || card.find('img').attr('src') || '';
                    if (image.startsWith('//')) image = 'https:' + image;

                    const linkElement = card.find('a');
                    let link = linkElement.attr('href') || '';
                    if (link.startsWith('/')) link = 'https://www.fivisa.com.uy' + link;

                    if (title && priceRaw && !priceRaw.toLowerCase().includes('consultar')) {
                        const exists = products.find(p => p.title === title && p.price === priceRaw);
                        if (!exists) {
                            products.push({
                                id: `fivisa_${Date.now()}_${index}`,
                                provider: 'Fivisa',
                                title,
                                price: priceRaw,
                                image,
                                link
                            });
                        }
                    }
                }
            }
        });

        res.json(products);

    } catch (error) {
        console.error('Error scraping Fivisa:', error.message);
        res.status(500).json({ error: 'Error al obtener datos del proveedor', details: error.message });
    }
});

export default router;
