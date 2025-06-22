const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');

const embedData = async (imagePath, encryptedMessage, key) => {
    try {
        // Get original filename and extension
        const originalFilename = path.basename(imagePath);
        const timestamp = Date.now();
        
        // Use PNG format which is lossless and preserves LSB modifications
        let image = await Jimp.read(imagePath);
        
        // Convert the encrypted message to a buffer if it's not already
        const encryptedBuffer = Buffer.from(encryptedMessage, 'utf8');
        const dataLength = encryptedBuffer.length;

        // Debug logs
        console.log('Embedding data of length:', dataLength);
        console.log('Image dimensions:', image.bitmap.width, 'x', image.bitmap.height);
        console.log('Required pixels:', Math.ceil((dataLength * 8 + 32) / 3));
        console.log('First few bytes of encrypted data:', encryptedBuffer.slice(0, 20).toString('hex'));
        console.log('Original image path:', imagePath);
        console.log('Original image mime:', image.getMIME());

        const totalPixelsNeeded = 4 * 8 + 4 * 8 + dataLength * 8; // 4 bytes signature + 4 bytes for length + data bytes
        const totalPixelsAvailable = image.bitmap.width * image.bitmap.height;
        
        if (totalPixelsNeeded > totalPixelsAvailable) {
            throw new Error(`Data is too large to embed in the image. Need ${totalPixelsNeeded} pixels, but image only has ${totalPixelsAvailable} pixels.`);
        }

        // Embed a signature to identify stego images (4 bytes: "STEG")
        const signatureBuffer = Buffer.from("STEG");
        let bitIndex = 0;
        
        // Embed the signature - using RED channel for simplicity
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 8; j++) {
                const x = bitIndex % image.bitmap.width;
                const y = Math.floor(bitIndex / image.bitmap.width);
                
                const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                const bit = (signatureBuffer[i] >> j) & 1;
                
                // Modify LSB of red channel only
                pixel.r = (pixel.r & ~1) | bit;
                
                image.setPixelColor(Jimp.rgbaToInt(pixel.r, pixel.g, pixel.b, pixel.a), x, y);
                bitIndex++;
            }
        }

        // Embed message length (4 bytes)
        const lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32LE(dataLength, 0);
        
        console.log('Length buffer:', [...lengthBuffer].map(b => b.toString(16).padStart(2, '0')).join(' '));
        
        // Embed the length buffer
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 8; j++) {
                const x = bitIndex % image.bitmap.width;
                const y = Math.floor(bitIndex / image.bitmap.width);
                
                const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                const bit = (lengthBuffer[i] >> j) & 1;
                
                // Modify LSB of red channel
                pixel.r = (pixel.r & ~1) | bit;
                
                image.setPixelColor(Jimp.rgbaToInt(pixel.r, pixel.g, pixel.b, pixel.a), x, y);
                bitIndex++;
            }
        }

        // Embed the actual data
        for (let i = 0; i < dataLength; i++) {
            for (let j = 0; j < 8; j++) {
                const x = bitIndex % image.bitmap.width;
                const y = Math.floor(bitIndex / image.bitmap.width);
                
                if (y >= image.bitmap.height) {
                    throw new Error('Image too small for the message.');
                }
                
                const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                const bit = (encryptedBuffer[i] >> j) & 1;
                
                // Modify LSB of red channel
                pixel.r = (pixel.r & ~1) | bit;
                
                image.setPixelColor(Jimp.rgbaToInt(pixel.r, pixel.g, pixel.b, pixel.a), x, y);
                bitIndex++;
            }
        }

        // Save the stego image - ALWAYS USE PNG format to preserve LSBs regardless of input format
        const outputDir = path.dirname(imagePath);
        // Make sure we explicitly use .png extension
        const outputImagePath = path.join(outputDir, `stego_${timestamp}.png`);
        
        // Set quality to 100 and explicitly use PNG format
        await image.quality(100).setPalette().getBase64Async(Jimp.MIME_PNG);
        await image.writeAsync(outputImagePath);
        
        console.log('Stego image saved at:', outputImagePath);
        return outputImagePath;
    } catch (error) {
        console.error('Error in embedData:', error);
        throw error;
    }
};

const extractData = async (stegoImagePath, key) => {
    try {
        console.log("Starting extraction from:", stegoImagePath);
        
        // Check if the file exists
        if (!fs.existsSync(stegoImagePath)) {
            throw new Error(`File does not exist: ${stegoImagePath}`);
        }
        
        // Check file size
        const stats = fs.statSync(stegoImagePath);
        console.log("File size:", stats.size, "bytes");
        
        // Read the image
        const image = await Jimp.read(stegoImagePath);
        console.log("Image loaded, dimensions:", image.bitmap.width, "x", image.bitmap.height);
        console.log("Image MIME type:", image.getMIME());
        
        let bitIndex = 0;
        
        // First, check for the signature (4 bytes: "STEG")
        const signatureBuffer = Buffer.alloc(4);
        
        console.log("Extracting signature...");
        // Extract signature bits
        for (let i = 0; i < 4; i++) {
            signatureBuffer[i] = 0; // Initialize to 0
            for (let j = 0; j < 8; j++) {
                const x = bitIndex % image.bitmap.width;
                const y = Math.floor(bitIndex / image.bitmap.width);
                
                const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                const bit = pixel.r & 1;
                
                if (bit) {
                    signatureBuffer[i] |= (1 << j);
                }
                
                bitIndex++;
            }
        }
        
        // Verify signature
        const signature = signatureBuffer.toString('utf8');
        console.log("Extracted signature:", signature, "Hex:", signatureBuffer.toString('hex'));
        
        if (signature !== "STEG") {
            console.log("Invalid signature detected:", signature);
            // Log first few pixels for debugging
            console.log("First 10 pixels LSB (red channel):");
            for (let i = 0; i < 10; i++) {
                const pixel = Jimp.intToRGBA(image.getPixelColor(i % image.bitmap.width, Math.floor(i / image.bitmap.width)));
                console.log(`Pixel ${i}: LSB=${pixel.r & 1}, RGB=(${pixel.r},${pixel.g},${pixel.b})`);
            }
            throw new Error('This does not appear to be a valid stego image (missing signature).');
        }
        
        // Extract the length (4 bytes)
        const lengthBuffer = Buffer.alloc(4);
        
        // Extract length bits
        for (let i = 0; i < 4; i++) {
            lengthBuffer[i] = 0; // Initialize to 0
            for (let j = 0; j < 8; j++) {
                const x = bitIndex % image.bitmap.width;
                const y = Math.floor(bitIndex / image.bitmap.width);
                
                const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                const bit = pixel.r & 1;
                
                if (bit) {
                    lengthBuffer[i] |= (1 << j);
                }
                
                bitIndex++;
            }
        }
        
        // Add debug logging for lengthBuffer
        console.log('Length buffer raw bytes:', [...lengthBuffer].map(b => b.toString(16).padStart(2, '0')).join(' '));
        
        const dataLength = lengthBuffer.readUInt32LE(0);
        console.log('Extracted data length:', dataLength);
        
        // More relaxed validation - just check for obviously wrong values
        if (dataLength <= 0 || dataLength > 100000) {
            console.log("Invalid data length detected:", dataLength);
            throw new Error('Invalid data length detected. This may not be a valid stego image or the image may have been modified.');
        }
        
        // Extract the actual data bytes
        const extractedBuffer = Buffer.alloc(dataLength);
        
        console.log("Extracting message data...");
        
        // Extract data bits
        for (let i = 0; i < dataLength; i++) {
            extractedBuffer[i] = 0; // Initialize to 0
            for (let j = 0; j < 8; j++) {
                const x = bitIndex % image.bitmap.width;
                const y = Math.floor(bitIndex / image.bitmap.width);
                
                if (y >= image.bitmap.height) {
                    throw new Error('Corrupted stego image or incorrect format - unexpected end of image.');
                }
                
                const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
                const bit = pixel.r & 1;
                
                if (bit) {
                    extractedBuffer[i] |= (1 << j);
                }
                
                bitIndex++;
            }
        }
        
        // Convert to string
        const extractedData = extractedBuffer.toString('utf8');
        console.log('First 20 chars of extracted data:', extractedData.substring(0, 20));
        console.log('Contains colon?', extractedData.includes(':'));
        console.log('Extracted data byte length:', extractedBuffer.length);
        
        return extractedData;
    } catch (error) {
        console.error('Error in extractData:', error);
        throw error;
    }
};

module.exports = {
    embedData,
    extractData
};