const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Get all categories
router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.render('categories/index', { categories });
});

// Create a new category
router.get('/new', (req, res) => {
  res.render('categories/form', { category: {} });
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  await Category.create({ name });
  res.redirect('/categories');
});

// Edit a category
router.get('/:id/edit', async (req, res) => {
  const category = await Category.findById(req.params.id);
  res.render('categories/form', { category });
});

router.post('/:id', async (req, res) => {
  const { name } = req.body;
  await Category.findByIdAndUpdate(req.params.id, { name });
  res.redirect('/categories');
});

// Delete a category
router.post('/:id/delete', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect('/categories');
});

module.exports = router;
