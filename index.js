import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Import routers
import palacioRouter from './routes/palacio.js';
import ufoRouter from './routes/ufo.js';
import nnetRouter from './routes/nnet.js';
import lidertekRouter from './routes/lidertek.js';
import lucesproRouter from './routes/lucespro.js';
import xprostoreRouter from './routes/xprostore.js';
import electrouruguayRouter from './routes/electrouruguay.js';
import fivisaRouter from './routes/fivisa.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir peticiones desde el frontend de Angular
app.use(cors({
    origin: '*', // En producción debería limitarse al dominio del frontend
    methods: ['GET', 'POST']
}));

app.use(express.json());

// Routes
app.use('/api/palacio', palacioRouter);
app.use('/api/ufo', ufoRouter);
app.use('/api/nnet', nnetRouter);
app.use('/api/lidertek', lidertekRouter);
app.use('/api/lucespro', lucesproRouter);
app.use('/api/xprostore', xprostoreRouter);
app.use('/api/electrouruguay', electrouruguayRouter);
app.use('/api/fivisa', fivisaRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Scraper API is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Scraper API running on http://localhost:${PORT}`);
});
