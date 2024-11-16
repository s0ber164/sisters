import axios from 'axios';
import FormData from 'form-data';

// Note: You'll need to sign up for a free API key at https://api.picsart.io/
// Replace with your API key as an environment variable

export async function removeBackground(imageBuffer) {
  try {
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios({
      method: 'post',
      url: 'https://api.picsart.io/tools/1.0/removebg',
      data: formData,
      headers: {
        ...formData.getHeaders(),
        'x-picsart-api-key': process.env.PICSART_API_KEY,
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error removing background:', error.response?.data || error.message);
    throw new Error('Failed to remove background from image');
  }
}

// Helper function to check if buffer is an image
export function isImage(buffer) {
  const imageSignatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
  };

  for (const [format, signature] of Object.entries(imageSignatures)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      return true;
    }
  }
  return false;
}

// Helper function to validate image size (Picsart allows up to 10MB)
export function validateImageSize(buffer, maxSizeInMB = 10) {
  const sizeInMB = buffer.length / (1024 * 1024);
  return sizeInMB <= maxSizeInMB;
}
