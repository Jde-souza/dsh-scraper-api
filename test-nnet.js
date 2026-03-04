import axios from 'axios';
import * as cheerio from 'cheerio';

async function testNnet() {
    const searchUrl = `https://www.nnet.com.uy/buscar/resultado.php?buscar=auricular`;
    try {
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);

        // Encontrar todos los elementos que contengan la palabra USD
        let count = 0;
        $('*').each((i, el) => {
            // Evaluamos solo los elementos mas profundos (sin hijos que también contengan USD)
            const text = $(el).text();
            if (text.includes('USD') && $(el).children().length === 0 && count < 3) {
                console.log(`\n--- ENCONTRE USD en etiqueta <${el.name}> ---`);
                console.log("Clase:", $(el).attr('class'));
                console.log("Texto exacto:", text);

                // Mostrar el contenedor abuelo (probable tarjeta de producto)
                console.log("Contenedor Abuelo (HTML):");
                console.log($(el).parent().parent().html()?.substring(0, 1000).replace(/\s+/g, ' '));
                count++;
            }
        });

        if (count === 0) console.log("No se encontró ningún texto USD en hojas del DOM.");

    } catch (e) { console.error(e.message); }
}
testNnet();
