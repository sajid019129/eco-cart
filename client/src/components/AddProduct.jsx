import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Clothes');
  const [stock, setStock] = useState('1');
  const [condition, setCondition] = useState('Gently Used');
  const [imageUrls, setImageUrls] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageField = () => {
    if (imageUrls.length >= 20) {
      setError('You can upload a maximum of 20 images.');
      return;
    }
    setImageUrls([...imageUrls, '']);
  };

  const removeImageField = (index) => {
    if (imageUrls.length === 1) return;
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('You must be logged in to list a product.');
      return;
    }
    const user = JSON.parse(userStr);

    const validImages = imageUrls.filter(url => url.trim() !== '');

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : null,
          category,
          stock: Number(stock),
          condition,
          seller: user.id || user._id,
          images: validImages
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to list product');
      }

      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2>Post Item for Sale</h2>
        <p className="auth-subtitle">Declutter and sell your pre-owned items to buyers.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Denim Jacket, iPhone 12, Vintage Watch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Selling Price ($) *</label>
              <input
                type="number"
                name="price"
                className="form-input"
                placeholder="25"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Original / Previous Price ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="50 (Optional)"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                min="0"
                step="0.01"
              />
              <small className="form-help">Shows a discount cut-mark if set higher than selling price.</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Clothes">Clothes</option>
                <option value="Electronics">Electronics</option>
                <option value="Electronics (Phone/Laptop)">Electronics (Phone/Laptop)</option>
                <option value="Books">Books</option>
                <option value="Stationery">Stationery</option>
                <option value="Food">Food</option>
                <option value="Medicine">Medicine</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                className="form-input"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Item Condition *</label>
            <select
              className="form-select"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Gently Used">Gently Used</option>
              <option value="Heavily Used">Heavily Used</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Describe the condition, usage period, or reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Product Images (Up to 20 URLs)</label>
            {imageUrls.map((url, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Image URL #${index + 1}`}
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeImageField(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {imageUrls.length < 20 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addImageField}
                style={{ fontSize: '0.85rem' }}
              >
                + Add Another Image ({imageUrls.length}/20)
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Posting...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;