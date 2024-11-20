import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the product'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '', 
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category'],
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  quantity: {
    type: Number,
    default: 1,
    min: 0,
  },
  dimensions: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ subcategories: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
