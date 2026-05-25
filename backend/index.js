const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const aadharDir = path.join(uploadsDir, 'aadhar');
const rosterDir = path.join(uploadsDir, 'roster');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(aadharDir)) fs.mkdirSync(aadharDir, { recursive: true });
if (!fs.existsSync(rosterDir)) fs.mkdirSync(rosterDir, { recursive: true });

// Load environment variables
dotenv.config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const workerRoutes = require('./routes/workerRoutes');

const app = express();

// ──────────────────────────────────────────────
//  Middleware
// ──────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ──────────────────────────────────────────────
//  API Routes
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker', workerRoutes);

// ──────────────────────────────────────────────
//  Health Check
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────────
//  404 Handler
// ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ──────────────────────────────────────────────
//  Global Error Handler
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 10MB.' });
  }
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ──────────────────────────────────────────────
//  Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  Server running on http://localhost:${PORT}`);
  console.log(`📊  Health check: http://localhost:${PORT}/api/health\n`);
});
