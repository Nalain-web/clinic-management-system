// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './src/config/data-source.js'; 
import authRoutes from './src/routes/authRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'TypeORM Hybrid API online' });
});

// Mounted Gateways (Cleaned up the duplicate auth line!)
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// --- INITIALIZE TYPEORM DATA LAYER THEN START WEB SERVER ---
AppDataSource.initialize()
  .then(() => {
    console.log(" TypeORM Data Source established. Relational tables verified/synchronized.");
    
    app.listen(PORT, () => {
      console.log(` Hybrid PERN Server streaming live at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(" Critical Database Data Source connection crash:", error);
  });