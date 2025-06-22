const path = require('path');
const fs = require('fs');

class ImageController {
    constructor() {
        // No need to pass imageService as a parameter anymore
    }

    async uploadImage(req, res) {
        try {
            const image = req.file;
            if (!image) {
                return res.status(400).send('No image uploaded.');
            }
            res.status(200).json({ imageUrl: `/uploads/${image.filename}` });
        } catch (error) {
            res.status(500).send('Error uploading image.');
        }
    }

    async getImage(req, res) {
        try {
            const imageName = req.params.name;
            const imagePath = path.join(__dirname, '../../uploads', imageName);
            
            if (!fs.existsSync(imagePath)) {
                return res.status(404).send('Image not found.');
            }
            res.status(200).sendFile(imagePath);
        } catch (error) {
            res.status(500).send('Error retrieving image.');
        }
    }
}

module.exports = new ImageController();