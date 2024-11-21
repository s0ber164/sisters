const mongoose = require('mongoose');
require('dotenv').config();

const categories = [
  {
    name: 'Furniture',
    slug: 'furniture',
  },
  {
    name: 'Decor',
    slug: 'decor',
  },
  {
    name: 'Lighting',
    slug: 'lighting',
  },
  {
    name: 'Textiles',
    slug: 'textiles',
  },
];

// Define Category Schema
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function seedCategories() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    console.log('Clearing existing categories...');
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    console.log('Inserting new categories...');
    const result = await Category.insertMany(categories);
    console.log('Inserted categories:', result);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
