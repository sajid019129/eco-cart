import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    ecoRating: 5,
    ecoTags: ''
  });

  const categories = ['Medicine', 'Food', 'Electronics', 'Stationery', 'Books', 'Miscellaneous'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const tagsArray = formData.ecoTags.split(',').map(tag => tag.trim()).filter(Boolean);
      await axios.post('http://localhost:5000/api/products', {
        ...formData,
        ecoTags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '',
        ecoRating: 5,
        ecoTags: ''
      });
      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Add New Product Listing</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Product Title" value={formData.title} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
        <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input type="number" name="ecoRating" placeholder="Eco Rating (1-5)" min="1" max="5" value={formData.ecoRating} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input type="text" name="ecoTags" placeholder="Eco Tags (comma separated)" value={formData.ecoTags} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;