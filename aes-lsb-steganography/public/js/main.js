document.addEventListener('DOMContentLoaded', () => {
    const encodeForm = document.getElementById('encodeForm');
    const decodeForm = document.getElementById('decodeForm');

    if (encodeForm) {
        encodeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(encodeForm);
            const response = await fetch('/encode', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            alert(result.message);
        });
    }

    if (decodeForm) {
        decodeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(decodeForm);
            const response = await fetch('/decode', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            alert(result.message);
        });
    }

    // Image preview functionality
    const imageInput = document.getElementById('image');
    const stegoImageInput = document.getElementById('stegoImage');
    const imagePreview = document.getElementById('image-preview');
    const stegoPreview = document.getElementById('stego-preview');

    // For image input on encode page
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            previewImage(this, imagePreview);
        });
    }

    // For stego image input on decode page
    if (stegoImageInput && stegoPreview) {
        stegoImageInput.addEventListener('change', function() {
            previewImage(this, stegoPreview);
        });
    }

    // Function to preview the selected image
    function previewImage(input, previewElement) {
        previewElement.innerHTML = '';
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('preview-image');
                previewElement.appendChild(img);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Add character counter for the message textarea
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const counter = document.createElement('div');
        counter.classList.add('char-counter');
        counter.textContent = '0 characters';
        messageTextarea.parentNode.appendChild(counter);

        messageTextarea.addEventListener('input', function() {
            counter.textContent = `${this.value.length} characters`;
        });
    }

    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            // Toggle the input type between password and text
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Key strength meter
    const keyInput = document.getElementById('key');
    if (keyInput) {
        const strengthMeter = document.querySelector('.key-strength-meter');
        const strengthFill = document.querySelector('.key-strength-fill');
        const strengthText = document.querySelector('.key-strength-text');
        
        keyInput.addEventListener('input', () => {
            const value = keyInput.value;
            
            // Calculate password strength
            let strength = 0;
            let feedback = 'Too short';
            
            if (value.length >= 8) {
                strength += 1;
            }
            
            if (value.length >= 12) {
                strength += 1;
            }
            
            if (/[A-Z]/.test(value) && /[a-z]/.test(value)) {
                strength += 1;
            }
            
            if (/[0-9]/.test(value)) {
                strength += 1;
            }
            
            if (/[^A-Za-z0-9]/.test(value)) {
                strength += 1;
            }
            
            // Update the strength meter
            strengthMeter.className = 'key-strength-meter';
            
            if (value.length === 0) {
                strengthFill.style.width = '0%';
                feedback = 'No password';
            } else if (strength < 3) {
                strengthMeter.classList.add('strength-weak');
                feedback = 'Weak';
            } else if (strength < 4) {
                strengthMeter.classList.add('strength-medium');
                feedback = 'Medium';
            } else {
                strengthMeter.classList.add('strength-strong');
                feedback = 'Strong';
            }
            
            strengthText.textContent = `Key strength: ${feedback}`;
        });
    }
});