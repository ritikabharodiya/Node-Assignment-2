const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/product');
const Category = require('../models/category');
const path = require('path');

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/products');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Get all products
router.get('/', async (req, res) => {
  const products = await Product.find().populate('category');
  res.render('products/index', { products });
});

// Create a new product
router.get('/new', async (req, res) => {
  const categories = await Category.find();
  res.render('products/form', { product: {}, categories });
});

router.post('/', upload.array('images', 5), async (req, res) => {
  const { name, price, description, category } = req.body;
  const images = req.files.map(file => file.filename);
  await Product.create({ name, price, description, category, images });
  res.redirect('/products');
});

// Edit a product
router.get('/:id/edit', async (req, res) => {
  const product = await Product.findById(req.params.id);
  const categories = await Category.find();
  res.render('products/form', { product, categories });
});

router.post('/:id', upload.array('images', 5), async (req, res) => {
  const { name, price, description, category } = req.body;
  const images = req.files.map(file => file.filename);
  await Product.findByIdAndUpdate(req.params.id, { name, price, description, category, images });
  res.redirect('/products');
});

// Delete a product
router.post('/:id/delete', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/products');
});

module.exports = router;
