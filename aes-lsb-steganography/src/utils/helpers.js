const fs = require('fs');
const path = require('path');

// Function to check if a file exists
const fileExists = (filePath) => {
    return fs.existsSync(filePath);
};

// Function to read a file and return its content
const readFileContent = (filePath) => {
    if (fileExists(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    throw new Error('File does not exist');
};

// Function to write content to a file
const writeFileContent = (filePath, content) => {
    fs.writeFileSync(filePath, content, 'utf-8');
};

// Function to get the file extension
const getFileExtension = (filePath) => {
    return path.extname(filePath);
};

// Function to generate a random string of specified length
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Exporting the helper functions
module.exports = {
    fileExists,
    readFileContent,
    writeFileContent,
    getFileExtension,
    generateRandomString,
};