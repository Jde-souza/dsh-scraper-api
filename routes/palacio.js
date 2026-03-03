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
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = [];

        // NOTA: Estos selectores CSS dependerán del HTML real de Palacio de la Música.
        // Esto es una aproximación generica basada en tiendas de eCommerce típicas.
        $('.product-item, .item, article').each((index, element) => {
            // Limitar a los primeros 12 resultados para no saturar al cliente
            if (index >= 12) return;

            const titElement = $(element).find('.product-title, h2, .name');
            const title = titElement.text().trim();

            let priceRaw = $(element).find('.price, .product-price, .best-price').text().trim();
            // Limpiar el precio (quitar espacios, saltos de línea, símbolos si fuera necesario)
            priceRaw = priceRaw.replace(/[\n\r]/g, '').trim();

            const imgElement = $(element).find('img');
            const image = imgElement.attr('src') || imgElement.attr('data-src') || '';

            const linkElement = $(element).find('a');
            let link = linkElement.attr('href') || '';
            if (link && !link.startsWith('http')) {
                link = `https://www.palaciodelamusica.com.uy${link.startsWith('/') ? '' : '/'}${link}`;
            }

            if (title && priceRaw) {
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
