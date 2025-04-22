const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(xss());

// Global rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'https://richytechshoppingsite.netlify.app'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('Not allowed by CORS'));
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['set-cookie']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Parse cookies
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Origin:', req.get('origin'));
    console.log('Cookies:', req.cookies);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('MongoDB Connected');
            return;
        } catch (err) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
            if (i === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('CORS allowed origins:', allowedOrigins);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

startServer(); 