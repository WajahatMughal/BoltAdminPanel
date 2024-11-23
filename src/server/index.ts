import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());

// Create uploads directory and its subdirectories if they don't exist
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/categories', 'uploads/products'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for different types of uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type; // 'categories' or 'products'
    const uploadPath = path.join('uploads', type);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Upload endpoints
app.post('/upload/:type', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.params.type}/${req.file.filename}`;
  res.json({ url: fileUrl });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`File server running on port ${PORT}`);
});