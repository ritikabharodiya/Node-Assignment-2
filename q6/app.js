const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

connectDB();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
