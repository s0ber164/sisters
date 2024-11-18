import FormData from 'form-data';
import fetch from 'node-fetch';

const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY || '50926c2230e4ece9a79d1b86e44fd526ff680a5e';
const PHOTOROOM_API_URL = 'https://sdk.photoroom.com/v2/edit';

/**
 * Remove background from a single image
 * @param {Buffer} imageData - The image data to process
 * @returns {Promise<Buffer>} Processed image data
 */
export async function removeBackground(imageData) {
  console.log('Starting background removal...');
  
  try {
    const formData = new FormData();
    formData.append('image_file', imageData, {
      filename: 'image',
      contentType: 'application/octet-stream'
    });

    console.log('Sending request to PhotoRoom API...');
    
    const response = await fetch(`${PHOTOROOM_API_URL}`, {
      method: 'POST',
      headers: {
        'x-api-key': PHOTOROOM_API_KEY,
      },
      body: formData
    });

    console.log('PhotoRoom API response status:', response.status);

    if (!response.ok) {
      let errorMessage;
      try {
        const error = await response.json();
        console.error('PhotoRoom API error:', error);
        errorMessage = error.message || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }
      throw new Error(`Failed to remove background: ${errorMessage}`);
    }

    const resultBuffer = await response.buffer();
    console.log('Successfully processed image, size:', resultBuffer.length);
    return resultBuffer;
  } catch (error) {
    console.error('Error in removeBackground:', error);
    throw error;
  }
}

/**
 * Process multiple images in bulk
 * @param {Array<Buffer>} images - Array of images to process
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Array<Buffer>>} Array of processed images
 */
export async function processBulkImages(images, progressCallback = () => {}) {
  const results = [];
  let processed = 0;

  for (const image of images) {
    try {
      const result = await removeBackground(image);
      results.push(result);
    } catch (error) {
      console.error('Error processing image:', error);
      results.push(null);
    }

    processed++;
    progressCallback(processed / images.length);
  }

  return results;
}

/**
 * Replace background with a custom image or color
 * @param {Buffer} imageData - The image data to process
 * @param {string} background - URL of background image or color hex code
 * @returns {Promise<Buffer>} Processed image data
 */
export async function replaceBackground(imageData, background = '#AAAAAA') {
  console.log('Starting background replacement...');
  
  try {
    const formData = new FormData();
    formData.append('image_file', imageData, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('background', background);

    console.log('Sending request to PhotoRoom API:', {
      url: `${PHOTOROOM_API_URL}/segment`,
      method: 'POST',
      headers: {
        'x-api-key': PHOTOROOM_API_KEY,
      }
    });
    
    const response = await fetch(`${PHOTOROOM_API_URL}/segment`, {
      method: 'POST',
      headers: {
        'x-api-key': PHOTOROOM_API_KEY,
        ...formData.getHeaders(),
      },
      body: formData,
      format: {
        aspect_ratio: '4:3',
        margin: 0.06
      }
    });

    console.log('PhotoRoom API response status:', response.status);

    if (!response.ok) {
      let errorMessage;
      try {
        const error = await response.json();
        errorMessage = error.message || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }
      console.error('PhotoRoom API error:', errorMessage);
      throw new Error(`PhotoRoom API error: ${errorMessage}`);
    }

    console.log('Background replacement completed, getting response buffer...');
    const buffer = await response.buffer();
    console.log('Response buffer size:', buffer.length);
    return buffer;
  } catch (error) {
    console.error('Error in replaceBackground:', error);
    throw error;
  }
}

/**
 * Enhance image quality
 * @param {Buffer} imageData - The image data to process
 * @returns {Promise<Buffer>} Enhanced image data
 */
export async function enhanceImage(imageData) {
  console.log('Starting image enhancement...');
  
  try {
    const formData = new FormData();
    formData.append('image_file', imageData, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    console.log('Sending request to PhotoRoom API:', {
      url: `${PHOTOROOM_API_URL}/enhance`,
      method: 'POST',
      headers: {
        'x-api-key': PHOTOROOM_API_KEY,
      }
    });
    
    const response = await fetch(`${PHOTOROOM_API_URL}/enhance`, {
      method: 'POST',
      headers: {
        'x-api-key': PHOTOROOM_API_KEY,
        ...formData.getHeaders(),
      },
      body: formData,
      format: {
        margin: 0.06
      }
    });

    console.log('PhotoRoom API response status:', response.status);

    if (!response.ok) {
      let errorMessage;
      try {
        const error = await response.json();
        errorMessage = error.message || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }
      console.error('PhotoRoom API error:', errorMessage);
      throw new Error(`PhotoRoom API error: ${errorMessage}`);
    }

    console.log('Image enhancement completed, getting response buffer...');
    const buffer = await response.buffer();
    console.log('Response buffer size:', buffer.length);
    return buffer;
  } catch (error) {
    console.error('Error in enhanceImage:', error);
    throw error;
  }
}
