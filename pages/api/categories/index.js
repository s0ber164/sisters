import dbConnect from '../../../utils/dbConnect';
import Category from '../../../models/Category';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const categories = await Category.find({})
          .populate('subcategories')
          .sort({ level: 1, name: 1 });
        res.status(200).json({ success: true, data: categories });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
