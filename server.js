const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Configuration CORS - DOIT être avant helmet et rate limiting
const corsOptions = {
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origine (comme les apps mobiles ou Postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'https://church-frontend-51m6.onrender.com', 
            'https://church-front-lilac.vercel.app'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin', 
        'X-Requested-With', 
        'Content-Type', 
        'Accept', 
        'Authorization',
        'Cache-Control'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 heures
};

// Appliquer CORS AVANT tout autre middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security middleware (après CORS)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limite chaque IP à 100 requêtes par fenêtre
    message: {
        success: false,
        message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/', require('./routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Gestion spécifique des erreurs CORS
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            error: 'Origine non autorisée par CORS'
        });
    }
    
    // Ne pas exposer les détails d'erreur en production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Erreur serveur' 
        : err.message;
    
    res.status(500).json({
        success: false,
        error: errorMessage
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 CORS enabled for: ${corsOptions.origin}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

