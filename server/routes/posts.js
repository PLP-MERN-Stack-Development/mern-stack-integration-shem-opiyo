// server/routes/posts.js
const express = require('express');
const router = express.Router();
const { getAllPosts, getPost, createPost, updatePost, deletePost, addComment } = require('../controllers/postController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth'); // You'll create this

router.get('/', getAllPosts);
router.get('/:id', getPost);
router.post('/', protect, upload.single('featuredImage'), createPost);
router.put('/:id', protect, upload.single('featuredImage'), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/comments', protect, addComment);

module.exports = router;