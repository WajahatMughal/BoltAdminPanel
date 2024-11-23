import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory and its subdirectories
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/categories', 'uploads/products'];
  dirs.forEach(dir => {
    const path = join(__dirname, '..', dir);
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for different types of uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type;
    const uploadPath = join(__dirname, '..', 'uploads', type);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
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
    fileSize: 5 * 1024 * 1024
  }
});

// Serve static files
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

// Categories endpoints
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    const categoriesWithSubs = categories.map(category => {
      const subCategories = db.prepare('SELECT * FROM subcategories WHERE categoryId = ?').all(category.id);
      return { ...category, subCategories };
    });
    res.json(categoriesWithSubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', (req, res) => {
  const { name, imageUrl } = req.body;
  const id = crypto.randomUUID();
  try {
    db.prepare('INSERT INTO categories (id, name, imageUrl) VALUES (?, ?, ?)').run(id, name, imageUrl);
    res.json({ id, name, imageUrl, subCategories: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subcategories endpoints
app.post('/api/subcategories', (req, res) => {
  const { name, categoryId } = req.body;
  const id = crypto.randomUUID();
  try {
    db.prepare('INSERT INTO subcategories (id, name, categoryId) VALUES (?, ?, ?)').run(id, name, categoryId);
    res.json({ id, name, categoryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subcategories/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products endpoints
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    const productsWithImages = products.map(product => {
      const images = db.prepare('SELECT imageUrl FROM product_images WHERE productId = ?').all(product.id);
      return { ...product, images: images.map(img => img.imageUrl) };
    });
    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  const { name, description, price, stock, categoryId, subCategoryId, images } = req.body;
  const id = crypto.randomUUID();
  
  try {
    db.prepare(`
      INSERT INTO products (id, name, description, price, stock, categoryId, subCategoryId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description, price, stock, categoryId, subCategoryId);

    images.forEach(imageUrl => {
      db.prepare('INSERT INTO product_images (id, productId, imageUrl) VALUES (?, ?, ?)')
        .run(crypto.randomUUID(), id, imageUrl);
    });

    res.json({ id, name, description, price, stock, categoryId, subCategoryId, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  const { name, description, price, stock, categoryId, subCategoryId, images } = req.body;
  const { id } = req.params;

  try {
    db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, stock = ?, categoryId = ?, subCategoryId = ?
      WHERE id = ?
    `).run(name, description, price, stock, categoryId, subCategoryId, id);

    // Update images
    db.prepare('DELETE FROM product_images WHERE productId = ?').run(id);
    images.forEach(imageUrl => {
      db.prepare('INSERT INTO product_images (id, productId, imageUrl) VALUES (?, ?, ?)')
        .run(crypto.randomUUID(), id, imageUrl);
    });

    res.json({ id, name, description, price, stock, categoryId, subCategoryId, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload endpoint
app.post('/upload/:type', (req, res) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.params.type}/${req.file.filename}`;
    
    res.json({ url: fileUrl });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message || 'Something went wrong!' });
  }
  next();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});