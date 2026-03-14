const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const farmerRoutes = require('./routes/farmers');
const advisoryRoutes = require('./routes/advisory');

const app = express();

// Basic middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrotecx';

mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Multer configuration for image uploads
const uploadsDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `crop-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// API routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/advisory', advisoryRoutes);

// Image upload endpoint
app.post('/api/upload-image', upload.single('cropImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // NOTE: This is a placeholder for crop disease analysis.
  // In a production system, this is where you would integrate
  // an ML model or external service.
  const mockFindings = [
    'Leaf spots observed – could be early blight.',
    'Ensure proper crop rotation and avoid waterlogging.',
    'If symptoms persist, consult a local agricultural officer.',
  ];

  res.json({
    message: 'Image received successfully.',
    fileName: req.file.filename,
    possibleDisease: 'Prototype-only suggestion (no real diagnosis).',
    findings: mockFindings,
  });
});

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'AgroTecX' });
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Application listens on port 5000 by default as requested.
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`AgroTecX server running on http://localhost:${PORT}`);
});

