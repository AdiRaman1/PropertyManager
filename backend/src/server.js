// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration (allow frontend SPA on port 5173 / mobile webview)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'capacitor://localhost'],
  credentials: true
}));

app.use(express.json());

// Mount API Routes
app.use('/api', apiRoutes);

// Root Welcome
app.get('/', (req, res) => {
  res.json({
    name: 'PG Manager Multi-Tenant Core API',
    status: 'online',
    docs: '/api/health',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PG Manager Backend API running on http://localhost:${PORT}`);
});

export default app;
