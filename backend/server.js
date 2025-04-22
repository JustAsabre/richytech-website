const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://richytechshoppingsite.netlify.app',
    'https://richytech-website-1.onrender.com'
];

app.use(cors({
    origin: function(origin, callback) {
        console.log('Request origin:', origin);
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('No origin provided, allowing request');
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Origin not allowed:', origin);
            return callback(new Error('Not allowed by CORS'));
        }
        console.log('Origin allowed:', origin);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Add error handling for CORS preflight
app.options('*', cors());

app.use(express.json());

// Add request logging middleware with more details
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
        console.log('Body:', JSON.stringify(sanitizedBody, null, 2));
    }
    next();
});

// Connect to MongoDB with detailed logging
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/richytech', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
    console.log('MongoDB Connection Details:');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string:', process.env.MONGODB_URI ? '[HIDDEN]' : 'mongodb://localhost:27017/richytech');
    console.error('Full error details:', JSON.stringify(err, null, 2));
});

// Add a MongoDB connection event listeners
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    try {
        // Check MongoDB connection
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };

        res.json({
            status: 'ok',
            message: 'Server is running',
            timestamp: new Date(),
            environment: process.env.NODE_ENV || 'development',
            mongodb: {
                state: dbStatus[dbState],
                database: mongoose.connection.name,
                host: mongoose.connection.host
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Use the PORT environment variable provided by Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check endpoint: ${process.env.PORT ? 'https://richytech-website-1.onrender.com' : 'http://localhost:3000'}/api/health`);
}); 