const express = require('express');
const router = express.Router();
const Student = require('../models/student');

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const students = await Student.find();
    res.render('students', { students });
  } catch (err) {
    res.status(500).send('Error fetching students');
  }
});

router.get('/new', isAuthenticated, (req, res) => {
  res.render('edit-student', { student: {} });
});

router.post('/new', isAuthenticated, async (req, res) => {
  const { name, age, grade } = req.body;
  try {
    const student = new Student({ name, age, grade });
    await student.save();
    res.redirect('/students');
  } catch (err) {
    res.status(400).send('Error adding student');
  }
});

router.get('/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.render('edit-student', { student });
  } catch (err) {
    res.status(500).send('Error fetching student');
  }
});

router.post('/edit/:id', isAuthenticated, async (req, res) => {
  const { name, age, grade } = req.body;
  try {
    await Student.findByIdAndUpdate(req.params.id, { name, age, grade });
    res.redirect('/students');
  } catch (err) {
    res.status(400).send('Error updating student');
  }
});

router.post('/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students');
  } catch (err) {
    res.status(500).send('Error deleting student');
  }
});

module.exports = router;
