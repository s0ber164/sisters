import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import path from 'path';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import crypto from 'crypto';

async function downloadImage(url) {
  try {
    // Clean the URL by removing any whitespace and quotes
    const cleanUrl = url.trim().replace(/["']/g, '');
    console.log('Downloading image from:', cleanUrl);
    
    const response = await fetch(cleanUrl);
    if (!response.ok) {
      console.log(`Failed to fetch image from ${cleanUrl}, using placeholder`);
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.log(`Error downloading image from ${url}, using placeholder:`, error.message);
    return null;
  }
}

async function getUniqueFilename(imageUrl) {
  // Create a hash of the URL to use as the filename
  const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
  return `image-${hash}.png`;
}

async function processImageWithRembg(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const inputFilename = path.basename(inputPath);
    const outputFilename = `processed-${inputFilename}`;
    const outputPath = path.join(outputDir, outputFilename);
    
    console.log('Processing image with Rembg:', inputPath);
    console.log('Output path:', outputPath);

    const pythonScript = path.join(process.cwd(), 'scripts', 'process_single_image.py');
    const python = spawn('python', [
      pythonScript,
      inputPath,
      outputPath
    ]);

    let stdoutData = '';
    let stderrData = '';

    python.stdout.on('data', (data) => {
      stdoutData += data.toString();
      console.log('Python stdout:', data.toString());
    });

    python.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.error('Python stderr:', data.toString());
    });

    python.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code === 0) {
        resolve(`/uploads/${outputFilename}`);
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderrData}`));
      }
    });
  });
}

async function processProductImage(imageUrl, uploadDir) {
  try {
    // If no image URL provided, return placeholder
    if (!imageUrl) {
      return 'https://via.placeholder.com/400x400?text=No+Image';
    }

    const imageBuffer = await downloadImage(imageUrl);
    
    // If download failed, return placeholder
    if (!imageBuffer) {
      return 'https://via.placeholder.com/400x400?text=Image+Not+Found';
    }

    // Create uploads directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate consistent filename based on URL
    const filename = await getUniqueFilename(imageUrl);
    const filepath = path.join(uploadDir, filename);
    
    // Check if file already exists
    try {
      await fs.access(filepath);
      console.log('Image already exists:', filepath);
      return `/uploads/${filename}`;
    } catch {
      // File doesn't exist, proceed with download and processing
      await fs.writeFile(filepath, imageBuffer);
    }

    // If background removal is requested and the script exists, process with rembg
    try {
      const processedFilename = `processed-${filename}`;
      const processedPath = path.join(uploadDir, processedFilename);
      
      // Check if processed file already exists
      try {
        await fs.access(processedPath);
        console.log('Processed image already exists:', processedPath);
        return `/uploads/${processedFilename}`;
      } catch {
        // Process the image if it doesn't exist
        const result = await processImageWithRembg(filepath, uploadDir);
        if (result) {
          return result.replace(/\\/g, '/');
        }
      }
    } catch (error) {
      console.error('Background removal failed, using original image:', error);
    }

    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error processing product image:', error);
    return 'https://via.placeholder.com/400x400?text=Processing+Error';
  }
}

export default async function handler(req, res) {
  console.log('API route called: /api/products/upload');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get useRembg preference
    const useRembg = fields.useRembg ? fields.useRembg[0] === 'true' : true;
    console.log('Use Rembg:', useRembg);

    // Read file content
    const file = files.file[0];
    const fileContent = await fs.readFile(file.filepath, 'utf-8');

    // Parse CSV synchronously
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Get all categories for reference
    const categories = await Category.find({});
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat._id);
    });
    
    // Process each product's images and categories
    const processedProducts = await Promise.all(records.map(async (record) => {
      console.log('Processing record:', record);
      
      // Split image URLs by both spaces and commas, and clean them
      const imageUrls = record.image_url
        ? record.image_url
            .split(/[\s,]+/)
            .map(url => url.trim())
            .filter(url => url.length > 0)
        : [];
      
      console.log('Images to process:', imageUrls);
      
      // Process each image
      const processedImages = await Promise.all(
        imageUrls.map(async (url) => {
          if (useRembg) {
            return processProductImage(url, uploadDir);
          } else {
            // If not using rembg, just return the original URL
            return url;
          }
        })
      );
      
      // Filter out failed images (null values)
      const validImages = processedImages.filter(url => url !== null);
      console.log('Processed images:', validImages);

      // Find category and subcategories
      let categoryId = null;
      let subcategoryIds = [];

      if (record.category) {
        const categoryName = record.category.trim().toLowerCase();
        categoryId = categoryMap.get(categoryName);
        
        if (!categoryId) {
          // Create new category if it doesn't exist
          const newCategory = await Category.create({ name: record.category.trim() });
          categoryId = newCategory._id;
          categoryMap.set(categoryName, categoryId);
        }
      }

      if (record.subcategories) {
        const subcategoryNames = record.subcategories
          .split(',')
          .map(s => s.trim())
          .filter(s => s);

        for (const subName of subcategoryNames) {
          const subNameLower = subName.toLowerCase();
          let subId = categoryMap.get(subNameLower);

          if (!subId) {
            // Create new subcategory if it doesn't exist
            const newSub = await Category.create({
              name: subName,
              parent: categoryId
            });
            subId = newSub._id;
            categoryMap.set(subNameLower, subId);
          }

          subcategoryIds.push(subId);
        }
      }

      return {
        name: record.name || '',
        description: record.description || '',
        price: parseFloat(record.price) || 0,
        quantity: parseInt(record.quantity) || 1,
        dimensions: record.dimensions || '',
        images: validImages,
        category: categoryId,
        subcategories: subcategoryIds,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }));

    // Validate products
    if (processedProducts.length === 0) {
      return res.status(400).json({ error: 'No valid products found in CSV' });
    }

    // Insert products using Mongoose
    const result = await Product.insertMany(processedProducts);
    console.log('Inserted products:', result.length);

    // Return success response
    return res.status(200).json({ 
      message: 'Products uploaded successfully',
      count: result.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Error processing upload',
      details: error.message 
    });
  }
}
