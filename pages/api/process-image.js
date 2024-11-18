import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('API route called: /api/process-image');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Parse the incoming form data
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate MD5 hash of the file
    const fileBuffer = await fs.readFile(file.filepath);
    const hash = createHash('md5').update(fileBuffer).digest('hex');
    
    // Create a new filename with the hash
    const ext = path.extname(file.originalFilename);
    const newFilename = `${hash}${ext}`;
    const newPath = path.join(uploadDir, newFilename);

    // Check if file with this hash already exists
    try {
      await fs.access(newPath);
      console.log('File already exists, using existing file');
      // Delete the uploaded file since we'll use the existing one
      await fs.unlink(file.filepath);
    } catch {
      // File doesn't exist, move the uploaded file to new location
      await fs.rename(file.filepath, newPath);
      console.log('File processed and saved:', newFilename);
    }

    // Return the URL for the processed image
    const imageUrl = `/uploads/${newFilename}`;
    res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
}
