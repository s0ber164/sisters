const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  level: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

// Function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const categories = [
  {
    name: 'Softs',
    subcategories: ['Pillows']
  },
  {
    name: 'Lighting',
    subcategories: ['Floor Lamps', 'Desk Lamps', 'Table Lamps']
  },
  {
    name: 'Decor',
    subcategories: [
      'Accessories & Objects',
      'Boxes',
      'Candle Holders',
      'Mirrors',
      'Decorative Bowls & Plates',
      'Glassware & Barware',
      'Kids Decor',
      'Trays',
      'Vases/Urns'
    ]
  },
  {
    name: 'Furniture',
    subcategories: [
      'Bar Carts',
      'Beds',
      'Benches & Stools',
      'Coffee Tables',
      'Desks',
      'Dining Tables',
      'Dressers',
      'Nightstands',
      'Patio Furniture',
      'Side Tables & End Tables',
      'Seating'
    ]
  },
  {
    name: 'Rugs',
    subcategories: []
  }
];

async function createCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create main categories first
    for (const cat of categories) {
      const mainCategory = await Category.create({
        name: cat.name,
        slug: generateSlug(cat.name),
        description: `${cat.name} category`,
        level: 0
      });
      console.log(`Created main category: ${cat.name}`);

      // Create subcategories
      for (const subCat of cat.subcategories) {
        await Category.create({
          name: subCat,
          slug: generateSlug(subCat),
          description: `${subCat} subcategory`,
          parentCategory: mainCategory._id,
          level: 1
        });
        console.log(`Created subcategory: ${subCat} under ${cat.name}`);
      }
    }

    console.log('All categories created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating categories:', error);
    process.exit(1);
  }
}

createCategories();
