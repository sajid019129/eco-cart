import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProduct = ({ user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    condition: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation: Check required fields
    if (
      !formData.title.trim() ||
      !formData.price ||
      formData.stock === '' ||
      !formData.category ||
      !formData.condition ||
      !formData.description.trim()
    ) {
      setError('Please fill up all required fields and information.');
      return;
    }

    const currentPrice = Number(formData.price);
    const originalPrice = formData.originalPrice ? Number(formData.originalPrice) : null;

    if (currentPrice <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (originalPrice !== null && originalPrice <= currentPrice) {
      setError('Previous price must be higher than the current selling price.');
      return;
    }

    if (Number(formData.stock) < 0) {
      setError('Please enter a valid stock amount.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        price: currentPrice,
        originalPrice: originalPrice,
        stock: Number(formData.stock),
        category: formData.category,
        condition: formData.condition,
        description: formData.description,
        seller: user?.id || user?._id
      };

      await axios.post('http://localhost:5000/api/products', payload);
      navigate('/products');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to list product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Post Item for Sale 📦</h2>
        <p style={styles.subtitle}>List your pre-owned or new items for the community marketplace.</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Product Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Product Title <span style={styles.requiredAsterisk}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Dual Price Row */}
          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>
                Current Price in BDT (৳) <span style={styles.requiredAsterisk}>*</span>
              </label>
              <input
                type="number"
                name="price"
                min="1"
                step="1"
                value={formData.price}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Previous Price in BDT (৳)</label>
              <input
                type="number"
                name="originalPrice"
                min="1"
                step="1"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="Optional"
                style={styles.input}
              />
            </div>
          </div>

          {/* Stock Availability */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Stock Availability <span style={styles.requiredAsterisk}>*</span>
            </label>
            <input
              type="number"
              name="stock"
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Category */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Category <span style={styles.requiredAsterisk}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="" disabled>Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Medicine">Medicine</option>
              <option value="Food">Food</option>
              <option value="Stationery">Stationery</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          {/* Item Condition */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Item Condition <span style={styles.requiredAsterisk}>*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="" disabled>Select condition</option>
              <option value="Brand New / Unopened">Brand New / Unopened</option>
              <option value="Like New / Mint Condition">Like New / Mint Condition</option>
              <option value="Good / Gently Used">Good / Gently Used</option>
              <option value="Fair / Functional">Fair / Functional</option>
              <option value="Heavily Used / Refurbished">Heavily Used / Refurbished</option>
            </select>
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description <span style={styles.requiredAsterisk}>*</span>
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide adequate descriptions of the product"
              style={styles.textarea}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Submitting...' : 'Post Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f8f9fa',
    minHeight: 'calc(100vh - 70px)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px 35px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    maxWidth: '550px',
    width: '100%',
  },
  title: {
    margin: '0 0 6px 0',
    color: '#1b4332',
    fontSize: '1.8rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.95rem',
    marginBottom: '25px',
  },
  errorAlert: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  row: {
    display: 'flex',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2b2b2b',
  },
  requiredAsterisk: {
    color: '#d32f2f',
    fontWeight: 'bold',
    marginLeft: '2px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    backgroundColor: '#fff',
    outline: 'none',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitBtn: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s ease',
  },
};

export default AddProduct;