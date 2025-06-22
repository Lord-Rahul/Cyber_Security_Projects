const fs = require('fs');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const imageService = {
    uploadImage: (req, res) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Image upload failed', error: err });
            }
            res.status(200).json({ message: 'Image uploaded successfully', filePath: req.file.path });
        });
    },

    serveImage: (req, res) => {
        const imagePath = path.join(__dirname, '../../', req.params.imageName);
        fs.access(imagePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ message: 'Image not found' });
            }
            res.sendFile(imagePath);
        });
    }
};

module.exports = imageService;