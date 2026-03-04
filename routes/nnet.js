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
        // NNET usa un parámetro de búsqueda estándar o lo verificamos con el script de prueba
        // Especulativo: https://www.nnet.com.uy/buscar?q=...
        const searchUrl = `https://www.nnet.com.uy/buscar?q=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = [];

        // Los selectores serán reemplazados después de las pruebas...

        res.json(products);

    } catch (error) {
        console.error('Error scraping NNET:', error.message);
        res.status(500).json({ error: 'Error al obtener datos del proveedor', details: error.message });
    }
});

export default router;
