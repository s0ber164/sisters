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

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    multiples: true,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const processedFiles = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];

    for (const file of fileArray) {
      if (!file) continue;

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
        console.log('File already exists, using existing file:', newFilename);
        // Delete the uploaded file since we'll use the existing one
        await fs.unlink(file.filepath);
      } catch {
        // File doesn't exist, move the uploaded file to new location
        await fs.rename(file.filepath, newPath);
        console.log('File processed and saved:', newFilename);
      }

      processedFiles.push({
        originalName: file.originalFilename,
        url: `/uploads/${newFilename}`,
      });
    }

    res.status(200).json({ 
      message: 'Files processed successfully',
      files: processedFiles 
    });

  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ 
      message: 'Error processing files', 
      error: error.message 
    });
  }
}
