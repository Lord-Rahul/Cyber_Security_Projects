const { encryptMessage, decryptMessage } = require('../src/services/aesService');

describe('AES Service', () => {
    const key = 'testkey12345678'; // 16 bytes for AES-128
    const message = 'Hello, World!';
    
    test('should encrypt and decrypt a message correctly', () => {
        const encryptedBuffer = encryptMessage(message, key);
        const decryptedMessage = decryptMessage(encryptedBuffer, key);
        
        expect(decryptedMessage.toString()).toBe(message);
    });

    test('should throw an error for invalid key length', () => {
        const invalidKey = 'shortkey'; // Invalid key length
        expect(() => encryptMessage(message, invalidKey)).toThrow();
    });

    test('should throw an error for empty message', () => {
        expect(() => encryptMessage('', key)).toThrow();
    });
});