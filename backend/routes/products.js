const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateProduct = [
    body('name').trim().notEmpty().withMessage('Product name is required')
        .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Other'])
        .withMessage('Invalid category'),
    body('imageUrl').isURL().withMessage('Valid image URL is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

// Get all products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || '-createdAt';
        const category = req.query.category;
        const search = req.query.search;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;

        let query = { isActive: true };

        // Apply filters
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-ratings');

        res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('ratings.user', 'username');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Create new product (Admin only)
router.post('/', [auth, validateProduct], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = new Product(req.body);
        await product.save();
        
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Update product (Admin only)
router.put('/:id', [auth, validateProduct], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete product (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Add or update product rating
router.post('/:id/ratings', [
    auth,
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const ratingIndex = product.ratings.findIndex(r => r.user.toString() === req.user.id);
        
        if (ratingIndex > -1) {
            // Update existing rating
            product.ratings[ratingIndex].rating = req.body.rating;
            product.ratings[ratingIndex].review = req.body.review;
        } else {
            // Add new rating
            product.ratings.push({
                user: req.user.id,
                rating: req.body.rating,
                review: req.body.review
            });
        }

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error rating product', error: error.message });
    }
});

// Search products
router.get('/search/:query', async (req, res) => {
    try {
        const products = await Product.find(
            { $text: { $search: req.params.query } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
});

module.exports = router; 