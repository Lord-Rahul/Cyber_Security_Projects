# AES-LSB Image Steganography

This project implements an AES-LSB image steganography application that allows users to securely hide and extract text messages within image files. The application uses AES encryption to secure the messages and LSB (Least Significant Bit) technique to embed the encrypted messages into images.

## Features

- **Image Upload**: Users can upload images to be used as cover images for embedding messages.
- **Message Encoding**: Users can input a message, which will be encrypted and embedded into the uploaded image.
- **Message Decoding**: Users can upload a stego image and enter the secret key to extract the hidden message.

## Technologies Used

- Node.js
- Express.js
- EJS (Embedded JavaScript) for templating
- AES-128-CBC for encryption
- LSB (Least Significant Bit) for steganography

## Project Structure

```
aes-lsb-steganography
├── src
│   ├── app.js
│   ├── controllers
│   │   ├── imageController.js
│   │   └── steganographyController.js
│   ├── services
│   │   ├── aesService.js
│   │   ├── lsbService.js
│   │   └── imageService.js
│   ├── utils
│   │   ├── validation.js
│   │   └── helpers.js
│   ├── routes
│   │   └── index.js
│   └── views
│       ├── index.ejs
│       ├── encode.ejs
│       └── decode.ejs
├── public
│   ├── css
│   │   └── style.css
│   └── js
│       └── main.js
├── tests
│   ├── aesService.test.js
│   └── lsbService.test.js
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd aes-lsb-steganography
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```
2. Open your browser and go to `http://localhost:3000`.
3. Use the interface to upload images and encode/decode messages.

## Testing

To run the tests, use the following command:
```
npm test
```

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.