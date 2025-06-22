const crypto = require('crypto');

const AES_ALGORITHM = 'aes-128-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Derives a fixed-length key using SHA-256 from the user-provided key
 * @param {string} userKey - The user-provided secret key
 * @returns {Buffer} - A 16-byte key suitable for AES-128
 */
function deriveKey(userKey) {
    // Create a SHA-256 hash of the user key
    const hash = crypto.createHash('sha256').update(userKey).digest();
    // Return first 16 bytes for AES-128
    return hash.slice(0, 16);
}

/**
 * Encrypts a message using AES-128-CBC with a derived key
 * @param {string} msg - Message to encrypt
 * @param {string} userKey - User-provided secret key
 * @returns {string} - IV and encrypted message in format "iv:encrypted"
 */
function encryptMessage(msg, userKey) {
    // Derive a proper key from the user input
    const key = deriveKey(userKey);
    
    // Generate a random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher with derived key and IV
    const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
    
    // Encrypt the message
    let encrypted = cipher.update(msg, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted message
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a message using AES-128-CBC with a derived key
 * @param {string} encryptedData - Data in format "iv:encrypted"
 * @param {string} userKey - User-provided secret key
 * @returns {string} - Decrypted message
 */
function decryptMessage(encryptedData, userKey) {
    try {
        // Derive the same key from user input
        const key = deriveKey(userKey);
        
        // Split the data into IV and encrypted text
        const parts = encryptedData.split(':');
        
        if (parts.length !== 2) {
            console.error('Invalid encrypted data format. Data:', encryptedData);
            throw new Error('Invalid encrypted data format');
        }
        
        // Extract IV and encrypted text
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        
        console.log('IV length:', iv.length, 'Expected:', IV_LENGTH);
        console.log('IV hex:', parts[0]);
        
        // Verify IV length
        if (iv.length !== IV_LENGTH) {
            console.error(`Invalid IV length: ${iv.length}, expected: ${IV_LENGTH}`);
            throw new Error('Invalid initialization vector length');
        }
        
        // Create decipher with derived key and extracted IV
        const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);
        
        // Decrypt the message
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Error in decryptMessage:', error);
        throw error;
    }
}

module.exports = {
    encryptMessage,
    decryptMessage
};