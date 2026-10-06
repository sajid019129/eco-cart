import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddProduct({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Electronics',
    description: '',
    ecoRating: '5'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Medicine',
    'Food',
    'Electronics',
    'Stationery',
    'Books',
    'Clothing',
    'Miscellaneous'
  ];

  const activeUser = user || JSON.parse(localStorage.getItem('user'));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title: formData.title,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      ecoRating: Number(formData.ecoRating),
      seller: activeUser?.id || activeUser?._id || null
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/products', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      navigate('/products');
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      const errMsg = err.response?.data?.error || err.response?.data?.details || 'Failed to list product.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Post Item for Sale 📦</h2>
        <p style={styles.subtitle}>List your surplus or eco-friendly items for the community.</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Product Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Dell XPS Laptop / College Textbooks"
              value={formData.title}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.rowGroup}>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>Price ($)</label>
              <input
                type="number"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Eco Sustainability Score (1 - 5)</label>
            <select
              name="ecoRating"
              value={formData.ecoRating}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="5">5 - Extremely Sustainable / Recycled</option>
              <option value="4">4 - High Reusability</option>
              <option value="3">3 - Moderate Sustainability</option>
              <option value="2">2 - Low Eco Score</option>
              <option value="1">1 - Standard Secondhand</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              placeholder="Provide condition, specs, or details about the item..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={styles.textarea}
            ></textarea>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Publishing Item...' : '+ Publish Product Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#f4f7f6',
    minHeight: 'calc(100vh - 70px)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '580px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1b4332',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '25px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  rowGroup: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
  },
  select: {
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  button: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '10px',
  },
  errorAlert: {
    backgroundColor: '#ffedd5',
    color: '#c2410c',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '15px',
  }
};

export default AddProduct;