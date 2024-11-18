import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const templatePath = path.join(process.cwd(), 'data', 'template.csv');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=product_template.csv');
    res.status(200).send(templateContent);
  } catch (error) {
    console.error('Error serving template:', error);
    res.status(500).json({ error: 'Error downloading template' });
  }
}
