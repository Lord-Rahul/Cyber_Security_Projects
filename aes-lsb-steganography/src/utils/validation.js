module.exports = {
    validateMessage: (message) => {
        if (typeof message !== 'string' || message.length === 0) {
            throw new Error('Message must be a non-empty string.');
        }
        if (message.length > 1000) {
            throw new Error('Message exceeds the maximum length of 1000 characters.');
        }
    },

    validateKey: (key) => {
        if (typeof key !== 'string' || key.length !== 32) {
            throw new Error('Key must be a string of 32 characters.');
        }
    },

    validateImage: (image) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(image.mimetype)) {
            throw new Error('Invalid image type. Only JPEG, PNG, and GIF are allowed.');
        }
    }
};