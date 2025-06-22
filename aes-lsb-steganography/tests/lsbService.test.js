const lsbService = require('../src/services/lsbService');
const fs = require('fs');
const path = require('path');

describe('LSB Service', () => {
    const testImagePath = path.join(__dirname, 'testImage.png');
    const testStegoImagePath = path.join(__dirname, 'testStegoImage.png');
    const testMessage = 'Hello, this is a secret message!';
    const testKey = 'mysecretkey1234'; // Example key for testing

    beforeAll(() => {
        // Create a test image file for embedding
        const imageBuffer = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // Placeholder for a simple image
        fs.writeFileSync(testImagePath, imageBuffer);
    });

    afterAll(() => {
        // Clean up test files
        fs.unlinkSync(testImagePath);
        if (fs.existsSync(testStegoImagePath)) {
            fs.unlinkSync(testStegoImagePath);
        }
    });

    test('should embed data into an image', () => {
        const encryptedBuffer = Buffer.from(testMessage); // Simulating encrypted message
        lsbService.embedData(testImagePath, encryptedBuffer, testKey);
        
        // Check if the stego image is created
        expect(fs.existsSync(testStegoImagePath)).toBe(true);
    });

    test('should extract data from a stego image', () => {
        const encryptedBuffer = Buffer.from(testMessage); // Simulating encrypted message
        lsbService.embedData(testImagePath, encryptedBuffer, testKey);
        
        const extractedMessage = lsbService.extractData(testStegoImagePath, testKey);
        
        // Check if the extracted message matches the original message
        expect(extractedMessage.toString()).toBe(testMessage);
    });
});