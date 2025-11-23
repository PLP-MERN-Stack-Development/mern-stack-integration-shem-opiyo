// server/controllers/postController.js
const Post = require('../models/Post');
const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');

// GET all posts (with pagination, category filter, search)
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };

    // Category filter
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) query.category = category._id;
    }

    // Search by title or content
    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { content: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single post by ID or slug
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    })
      .populate('author', 'name')
      .populate('category', 'name slug')
      .populate('comments.user', 'name');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE new post (protected + image upload)
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, excerpt, tags, isPublished } = req.body;

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) return res.status(400).json({ message: 'Invalid category' });

    const post = new Post({
      title,
      content,
      excerpt,
      tags: tags ? tags.split(',') : [],
      category: categoryDoc._id,
      author: req.user._id,
      isPublished: isPublished === 'true',
      featuredImage: req.file ? `/uploads/${req.file.filename}` : 'default-post.jpg',
    });

    await post.save();
    await post.populate('author', 'name').populate('category', 'name slug');

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE post
exports.updatePost = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.featuredImage = `/uploads/${req.file.filename}`;
    }

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      updates,
      { new: true, runValidators: true }
    )
      .populate('author', 'name')
      .populate('category', 'name slug');

    if (!post) return res.status(404).json({ message: 'Post not found or not authorized' });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!post) return res.status(404).json({ message: 'Post not found or not authorized' });

    // Optional: delete image file
    if (post.featuredImage && post.featuredImage !== 'default-post.jpg') {
      fs.unlink(path.join(__dirname, '..', post.featuredImage), (err) => {
        if (err) console.log('Failed to delete image:', err);
      });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      user: req.user._id,
      content: req.body.content,
    });

    await post.save();
    await post.populate('comments.user', 'name');

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};