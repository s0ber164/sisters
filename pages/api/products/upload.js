import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import dbConnect from '../../../utils/dbConnect';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import path from 'path';
import { spawn } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  console.log('API route called: /api/products/upload');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database');
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const outputDir = path.join(uploadDir, 'processed');
    
    console.log('Creating directories...');
    console.log('Upload dir:', uploadDir);
    console.log('Output dir:', outputDir);
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.mkdir(outputDir, { recursive: true });
    } catch (dirError) {
      console.error('Error creating directories:', dirError);
      return res.status(500).json({ 
        error: 'Failed to create upload directories',
        details: dirError.message 
      });
    }

    // Configure formidable
    const options = {
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
      allowEmptyFiles: false,
    };

    const form = new IncomingForm(options);

    // Parse form data
    const [fields, files] = await new Promise((resolve, reject) => {
      console.log('Starting form parse...');
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);
          reject(err);
          return;
        }
        console.log('Form parse complete. Fields:', fields);
        console.log('Files:', Object.keys(files));
        resolve([fields, files]);
      });
    });

    console.log('Raw useRembg field:', {
      value: fields.useRembg,
      type: typeof fields.useRembg,
      truthyCheck: !!fields.useRembg,
      equalTrue: fields.useRembg === 'true',
      equalTrueBool: fields.useRembg === true
    });

    // Get the uploaded file
    const uploadedFile = files.file?.[0] || files.file;
    if (!uploadedFile) {
      console.error('No file found in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', {
      name: uploadedFile.originalFilename,
      size: uploadedFile.size,
      path: uploadedFile.filepath
    });

    // Read and parse CSV
    let fileContent;
    try {
      fileContent = await fs.readFile(uploadedFile.filepath, 'utf-8');
    } catch (readError) {
      console.error('Error reading file:', readError);
      return res.status(500).json({ 
        error: 'Failed to read uploaded file',
        details: readError.message 
      });
    }

    // Parse CSV
    let records;
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      console.log('CSV parsed successfully, records:', records.length);
      console.log('Sample record:', records[0]);
    } catch (parseError) {
      console.error('Error parsing CSV:', parseError);
      return res.status(400).json({ 
        error: 'Failed to parse CSV file',
        details: parseError.message 
      });
    }

    // Process images with rembg if enabled
    const useRembg = fields.useRembg === 'true';
    console.log('Use rembg flag:', useRembg);
    console.log('Raw useRembg value:', fields.useRembg);

    if (useRembg) {
      console.log('Processing images with rembg...');
      
      // Create a temporary CSV file with just the image URLs
      const imagesCsvPath = path.join(uploadDir, `images_${Date.now()}.csv`);
      const imageUrls = records
        .filter(record => record.image_url)
        .map(record => ({ image_url: record.image_url }));

      console.log('Found image URLs:', imageUrls.length);
      console.log('Sample image URL:', imageUrls[0]?.image_url);

      if (imageUrls.length === 0) {
        console.log('No images to process');
      } else {
        try {
          // Write image URLs to temporary CSV
          const csvContent = `image_url\n${imageUrls.map(row => 
            `"${row.image_url}"`
          ).join('\n')}`;
          
          await fs.writeFile(imagesCsvPath, csvContent);
          console.log('Created temporary image CSV file at:', imagesCsvPath);
          console.log('CSV content sample:', csvContent.slice(0, 200));

          const scriptPath = path.join(process.cwd(), 'scripts', 'process_images.py');
          
          console.log('Running Python script with args:', {
            script: scriptPath,
            imagesCsv: imagesCsvPath,
            outputDir: outputDir
          });

          const python = spawn('python', [
            scriptPath,
            imagesCsvPath,
            outputDir
          ]);

          let outputData = '';
          let errorData = '';

          python.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Python output:', output);
            outputData += output;
          });

          python.stderr.on('data', (data) => {
            const error = data.toString();
            console.error('Python error:', error);
            errorData += error;
          });

          await new Promise((resolve, reject) => {
            python.on('close', (code) => {
              console.log('Python process exited with code:', code);
              if (code !== 0) {
                reject(new Error(`Python script failed:\n${errorData || outputData}`));
              } else {
                resolve(outputData);
              }
            });

            python.on('error', (err) => {
              console.error('Failed to start Python process:', err);
              reject(new Error(`Failed to start Python process: ${err.message}`));
            });
          });

          console.log('Image processing completed');
          
          // Clean up temporary CSV file
          await fs.unlink(imagesCsvPath);

          // Update image URLs in records to use processed images
          records = records.map((record, index) => {
            if (record.image_url) {
              const newImageUrl = `/uploads/processed/processed_${index + 1}.png`;
              console.log(`Updating image URL for ${record.name}: ${newImageUrl}`);
              return {
                ...record,
                image_url: newImageUrl
              };
            }
            return record;
          });
        } catch (error) {
          console.error('Error processing images:', error);
          throw new Error(`Failed to process images: ${error.message}`);
        }
      }
    }

    // Get all categories for reference
    const categories = await Category.find({});
    const categoryMap = new Map();
    categories.forEach(cat => {
      // Store both original name and lowercase version
      categoryMap.set(cat.name.toLowerCase(), {
        id: cat._id,
        name: cat.name,
        parent: cat.parent
      });
    });
    
    console.log('Categories loaded:', categoryMap.size);
    console.log('Category map:', Object.fromEntries(categoryMap));

    // Helper function to create category
    const createCategory = async (name, parentId = null) => {
      try {
        // Capitalize first letter of each word
        const formattedName = name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        const slug = formattedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        // Check for existing category (case insensitive)
        const existingCategory = await Category.findOne({
          $or: [
            { slug },
            { name: { $regex: new RegExp(`^${formattedName}$`, 'i') } }
          ]
        });

        if (existingCategory) {
          console.log('Category already exists:', {
            name: existingCategory.name,
            slug: existingCategory.slug,
            id: existingCategory._id
          });
          
          // If this is a subcategory and the parent doesn't match, create a new one with a unique name
          if (parentId && !existingCategory.parent?.equals(parentId)) {
            const timestamp = Date.now();
            const uniqueName = `${formattedName} ${timestamp}`;
            const uniqueSlug = `${slug}-${timestamp}`;
            
            const category = new Category({
              name: uniqueName,
              slug: uniqueSlug,
              parent: parentId
            });

            const savedCategory = await category.save();
            console.log('Created new category with unique name:', {
              name: savedCategory.name,
              slug: savedCategory.slug,
              id: savedCategory._id,
              parent: savedCategory.parent
            });

            return savedCategory._id;
          }
          
          return existingCategory._id;
        }

        const category = new Category({
          name: formattedName,
          slug,
          parent: parentId
        });

        const savedCategory = await category.save();
        console.log('Created new category:', {
          name: savedCategory.name,
          slug: savedCategory.slug,
          id: savedCategory._id,
          parent: savedCategory.parent
        });

        return savedCategory._id;
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    };

    // Process each product
    const processedProducts = await Promise.all(records.map(async (record, index) => {
      console.log(`Processing record ${index + 1}/${records.length}:`, {
        name: record.name,
        category: record.category,
        subcategories: record.subcategories
      });

      // Find or create category
      let categoryId = null;
      let subcategoryIds = [];

      if (!record.category) {
        throw new Error(`Category is required for product at row ${index + 1}`);
      }

      const categoryName = record.category.trim();
      const categoryNameLower = categoryName.toLowerCase();
      
      try {
        // Find or create main category
        const existingCategory = categoryMap.get(categoryNameLower);
        categoryId = existingCategory?.id;
        
        if (!categoryId) {
          console.log('Creating new category:', categoryName);
          categoryId = await createCategory(categoryName);
          categoryMap.set(categoryNameLower, {
            id: categoryId,
            name: categoryName,
            parent: null
          });
          console.log('Created category with ID:', categoryId);
        } else {
          console.log('Found existing category:', categoryName, 'with ID:', categoryId);
        }

        // Process subcategories if they exist
        if (record.subcategories) {
          const subcategoryNames = record.subcategories
            .split(',')
            .map(s => s.trim())
            .filter(s => s);

          console.log('Processing subcategories:', subcategoryNames);

          for (const subName of subcategoryNames) {
            // Format subcategory name
            const formattedSubName = subName
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');

            const fullSubName = `${categoryName} - ${formattedSubName}`;
            const subNameLower = fullSubName.toLowerCase();

            // Try to find subcategory by full name first
            const existingSubcategory = categoryMap.get(subNameLower);
            let subId = existingSubcategory?.id;

            if (!subId) {
              console.log('Creating new subcategory:', fullSubName);
              subId = await createCategory(fullSubName, categoryId);
              categoryMap.set(subNameLower, {
                id: subId,
                name: fullSubName,
                parent: categoryId
              });
              console.log('Created subcategory with ID:', subId);
            } else {
              // Verify parent relationship
              const subcategory = await Category.findById(subId);
              if (!subcategory.parent?.equals(categoryId)) {
                console.log('Creating new subcategory due to different parent:', fullSubName);
                subId = await createCategory(fullSubName, categoryId);
                const newSubNameLower = `${fullSubName}-${Date.now()}`.toLowerCase();
                categoryMap.set(newSubNameLower, {
                  id: subId,
                  name: fullSubName,
                  parent: categoryId
                });
                console.log('Created subcategory with ID:', subId);
              } else {
                console.log('Found existing subcategory:', fullSubName, 'with ID:', subId);
              }
            }

            subcategoryIds.push(subId);
          }
        }
      } catch (error) {
        console.error('Error processing categories:', error);
        throw new Error(`Error processing categories for product at row ${index + 1}: ${error.message}`);
      }

      // Create product object
      const product = {
        name: record.name,
        description: record.description || '',
        price: parseFloat(record.price) || 0,
        quantity: parseInt(record.quantity) || 1,
        dimensions: record.dimensions || '',
        category: categoryId,
        subcategories: subcategoryIds,
        images: record.image_url ? 
          record.image_url
            .split(',')
            .map(url => url.trim())
            .filter(url => url) : 
          [],
      };

      console.log('Created product:', {
        name: product.name,
        category: product.category,
        subcategories: product.subcategories,
        images: product.images
      });

      return product;
    }));

    // Validate products
    if (processedProducts.length === 0) {
      return res.status(400).json({ error: 'No valid products found in CSV' });
    }

    console.log('Processed products:', processedProducts.length);

    // Insert products
    const result = await Product.insertMany(processedProducts);
    console.log('Products inserted successfully:', result.length);

    // Clean up the temporary file
    await fs.unlink(uploadedFile.filepath);

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
