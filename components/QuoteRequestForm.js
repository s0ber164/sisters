import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';

const QuoteRequestForm = ({ onClose }) => {
  const { selectedProducts } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    startDate: '',
    endDate: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total price
  const calculateTotalPrice = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
    return selectedProducts.reduce((total, product) => total + (product.price * weeks), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Calculate rental duration and total price
    const totalPrice = calculateTotalPrice();
    
    // Prepare email content
    const emailContent = {
      to: 'darrinmalone1@gmail.com',
      subject: 'New Prop Rental Quote Request',
      text: `
Name: ${formData.name}
Company: ${formData.companyName}
Phone: ${formData.phone}
Email: ${formData.email}
Rental Period: ${formData.startDate} to ${formData.endDate}
Comments: ${formData.comments || 'No comments provided'}

Selected Items:
${selectedProducts.map(product => `- ${product.name} ($${product.price}/week)`).join('\n')}

Total Rental Price: $${totalPrice.toFixed(2)}
      `,
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContent),
      });

      if (!response.ok) throw new Error('Failed to send email');

      alert('Quote request sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('Failed to send quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-900">Request Quote</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              required
              value={formData.endDate}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Selected Items */}
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Selected Items</h3>
          <div className="space-y-2">
            {selectedProducts.map(product => (
              <div key={product.id} className="flex justify-between text-sm">
                <span>{product.name}</span>
                <span>${product.price}/week</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-medium">
              <span>Total Rental Price</span>
              <span>${calculateTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors duration-200 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Sending...' : 'Submit Quote Request'}
        </button>
      </form>
    </>
  );
};

export default QuoteRequestForm;
