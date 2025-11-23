// server/routes/categories.js
const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

router.get('/', getAllCategories);
router.post('/', protect, createCategory);  // Only logged-in users can create

module.exports = router;