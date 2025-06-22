const aesService = require('../services/aesService');
const lsbService = require('../services/lsbService');
const fs = require('fs');
const path = require('path');

class SteganographyController {
    async encodeMessage(req, res) {
        try {
            const { message, key } = req.body;
            const image = req.file;

            if (!image || !message || !key) {
                return res.status(400).send('Image, message, and key are required.');
            }

            // Log for debugging
            console.log('Encoding message with key:', key);
            console.log('Message length:', message.length);
            console.log('Image path:', image.path);
            console.log('Image mimetype:', image.mimetype);
            
            const encryptedMessage = aesService.encryptMessage(message, key);
            
            // Debug log - important to see the format
            console.log('Encrypted format:', encryptedMessage);
            console.log('Contains colon?', encryptedMessage.includes(':'));
            
            const stegoImagePath = await lsbService.embedData(image.path, encryptedMessage, key);

            // Add content disposition to force download as PNG
            res.setHeader('Content-Disposition', 'attachment; filename="stego_image.png"');
            res.setHeader('Content-Type', 'image/png');
            res.download(stegoImagePath, 'stego_image.png');
        } catch (error) {
            console.error('Encoding error:', error);
            res.status(500).send('Error encoding message: ' + error.message);
        }
    }

    async decodeMessage(req, res) {
        try {
            const { key } = req.body;
            const stegoImage = req.file;

            if (!stegoImage || !key) {
                return res.status(400).send('Stego image and key are required.');
            }

            try {
                // Log for debugging
                console.log('Decoding with key:', key);
                console.log('Stego image path:', stegoImage.path);
                console.log('Stego image mimetype:', stegoImage.mimetype);
                
                // Validate the image exists
                if (!fs.existsSync(stegoImage.path)) {
                    throw new Error(`File not found: ${stegoImage.path}`);
                }
                
                const encryptedData = await lsbService.extractData(stegoImage.path, key);
                
                // Debug logs
                console.log('Extracted data length:', encryptedData.length);
                console.log('First 20 chars of extracted data:', encryptedData.substring(0, 20));
                console.log('Contains colon?', encryptedData.includes(':'));
                
                // Check if the data is in the correct format
                if (!encryptedData.includes(':')) {
                    console.log('Extracted data does not contain a colon. Full data:', encryptedData);
                    return res.render('decode', {
                        message: null,
                        error: 'Invalid stego image format. The image doesn\'t contain a properly formatted encrypted message.'
                    });
                }
                
                const decryptedMessage = aesService.decryptMessage(encryptedData, key);
                res.render('decode', { message: decryptedMessage, error: null });
            } catch (decryptError) {
                console.error('Decryption error details:', decryptError);
                
                // Check for specific errors
                if (decryptError.message.includes('initialization vector')) {
                    return res.render('decode', { 
                        message: null, 
                        error: 'Invalid initialization vector. This could mean either the wrong key was used or the image does not contain a valid encrypted message.'
                    });
                }
                
                res.render('decode', { 
                    message: null, 
                    error: `Failed to decode: ${decryptError.message}. Make sure you're using the correct key and image.` 
                });
            }
        } catch (error) {
            console.error('Controller error:', error);
            res.status(500).send('Error decoding message: ' + error.message);
        }
    }
}

module.exports = new SteganographyController();