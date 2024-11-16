import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for the product'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  dimensions: {
    type: String,
    required: [true, 'Please provide dimensions'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
