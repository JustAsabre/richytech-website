const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Other'],
        index: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Product image URL is required']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    ratings: [ratingSchema],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Create text indexes for search functionality
productSchema.index({ 
    name: 'text', 
    description: 'text', 
    category: 'text' 
});

// Calculate average rating when a new rating is added or updated
productSchema.methods.calculateAverageRating = function() {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
        this.numberOfRatings = 0;
        return;
    }
    
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.numberOfRatings = this.ratings.length;
};

// Pre-save middleware to calculate average rating
productSchema.pre('save', function(next) {
    this.calculateAverageRating();
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 