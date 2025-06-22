const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImageController = require('../controllers/imageController');
const SteganographyController = require('../controllers/steganographyController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Sanitize the original filename
        const sanitizedName = Date.now() + path.extname(file.originalname);
        cb(null, sanitizedName);
    }
});

// Add file filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Route for uploading images
router.post('/upload', upload.single('image'), ImageController.uploadImage);

// Route for encoding messages into images
router.post('/encode', upload.single('image'), SteganographyController.encodeMessage);

// Route for decoding messages from images
router.post('/decode', upload.single('stegoImage'), SteganographyController.decodeMessage);

// Route for rendering the main page
router.get('/', (req, res) => {
    res.render('index');
});

// Route for rendering the encoding page
router.get('/encode', (req, res) => {
    res.render('encode');
});

// Route for rendering the decoding page
router.get('/decode', (req, res) => {
    res.render('decode', { message: null, error: null });
});

module.exports = router;