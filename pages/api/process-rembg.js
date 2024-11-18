import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create uploads and output directories
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const outputDir = path.join(process.cwd(), 'public', 'processed');
    
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    console.log('Processing request...');
    console.log('Upload directory:', uploadDir);
    console.log('Output directory:', outputDir);

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit for CSV
      filename: (name, ext, part, form) => {
        // Keep the original file extension for the uploaded file
        return `${Date.now()}_${part.originalFilename}`;
      },
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

    // In formidable v3, files.csv is an array
    const csvFile = Array.isArray(files.csv) ? files.csv[0] : files.csv;
    
    if (!csvFile || !csvFile.filepath) {
      throw new Error('No CSV file uploaded');
    }

    console.log('CSV file received:', csvFile.originalFilename);
    console.log('CSV file path:', csvFile.filepath);

    // Run Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'process_images.py');
    console.log('Python script path:', scriptPath);
    console.log('CSV filepath:', csvFile.filepath);

    const python = spawn('python', [
      scriptPath,
      csvFile.filepath,
      outputDir
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

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

    // Clean up the temporary CSV file
    await fs.unlink(csvFile.filepath).catch(console.error);

    // Return the list of processed images
    const processedFiles = await fs.readdir(outputDir);
    const processedUrls = processedFiles
      .filter(file => file.startsWith('processed_'))
      .map(file => `/processed/${file}`);

    console.log('Processed files:', processedUrls);

    return res.status(200).json({
      message: 'Images processed successfully',
      processed: processedUrls
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Failed to process images',
      error: error.message 
    });
  }
}
