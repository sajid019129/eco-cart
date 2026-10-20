import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProduct = ({ user, setProducts }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    condition: '',
    description: '',
    sellerName: user?.name || user?.username || '',
    phone: user?.phone || '',
    email: user?.email || '',
    location: user?.address || ''
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMediaChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    if (mediaFiles.length + selectedFiles.length > 5) {
      setError('You can upload a maximum of 5 media files (photos or videos) in total.');
      return;
    }

    for (let file of selectedFiles) {
      if (file.size > 100 * 1024 * 1024) {
        setError('Video must be below 100 MB.');
        return;
      }
    }

    setError('');

    const updatedFiles = [...mediaFiles, ...selectedFiles];
    setMediaFiles(updatedFiles);

    const newPreviews = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image'
    }));
    setMediaPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

    e.target.value = '';
  };

  const handleRemoveMedia = (indexToRemove) => {
    URL.revokeObjectURL(mediaPreviews[indexToRemove].url);

    setMediaFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setMediaPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mediaFiles.length < 1 || mediaFiles.length > 5) {
      setError('Please upload at least 1 and at most 5 product photos or videos.');
      return;
    }

    for (let file of mediaFiles) {
      if (file.size > 100 * 1024 * 1024) {
        setError('Video must be below 100 MB.');
        return;
      }
    }

    if (
      !formData.title.trim() ||
      !formData.price ||
      formData.stock === '' ||
      !formData.category ||
      !formData.condition ||
      !formData.description.trim() ||
      !formData.sellerName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.location.trim()
    ) {
      setError('Please fill up all required fields and information');
      return;
    }

    const currentPrice = Number(formData.price);
    const originalPrice = formData.originalPrice ? Number(formData.originalPrice) : null;

    if (currentPrice <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (originalPrice !== null && originalPrice <= currentPrice) {
      setError('Original/Previous price must be higher than the current selling price.');
      return;
    }

    if (Number(formData.stock) < 0) {
      setError('Please enter a valid stock amount.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('price', currentPrice);
      if (originalPrice !== null) data.append('originalPrice', originalPrice);
      data.append('stock', Number(formData.stock));
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('description', formData.description);
      data.append('sellerName', formData.sellerName);
      data.append('sellerPhone', formData.phone);
      data.append('sellerEmail', formData.email);
      data.append('sellerAddress', formData.location);
      data.append('location', formData.location);
      if (user?.id || user?._id) {
        data.append('seller', user.id || user._id);
      }

      mediaFiles.forEach((file) => {
        data.append('media', file);
      });

      const res = await axios.post('http://localhost:5000/api/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });
      
      if (setProducts) {
        setProducts(prev => [res.data, ...prev]);
      }

      navigate('/products');
    } catch (err) {
      console.error(err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The video file might be too heavy to process.');
      } else if (err.response?.status === 413) {
        setError('Video must be below 100 MB. File is too large.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to list product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Post Items for Sale 📦</h2>
        <p style={styles.subtitle}>List your pre-owned or new items for the community marketplace</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
              <label style={styles.label}>Original / Previous Price in BDT (৳)</label>
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

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Product Photos or Videos (Upload 1 to 5 Media Files, Max 100 MB each) <span style={styles.requiredAsterisk}>*</span>
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaChange}
              style={styles.fileInput}
              disabled={mediaFiles.length >= 5}
            />
            <small style={styles.hint}>Upload between 1 and 5 clear product photos or videos ({mediaFiles.length}/5 selected). Video must be below 100 MB.</small>

            {mediaPreviews.length > 0 && (
              <div style={styles.previewGrid}>
                {mediaPreviews.map((media, index) => (
                  <div key={index} style={styles.previewWrapper}>
                    {media.type === 'video' ? (
                      <video src={media.url} style={styles.previewImage} muted />
                    ) : (
                      <img
                        src={media.url}
                        alt={`Product Preview ${index + 1}`}
                        style={styles.previewImage}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      style={styles.removeBadge}
                      title="Remove Media"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.sellerBox}>
            <h3 style={styles.sellerHeader}>Seller Contact Details</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Full Name <span style={styles.requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                readOnly
                style={styles.readOnlyInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Phone Number <span style={styles.requiredAsterisk}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                readOnly
                style={styles.readOnlyInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Email Address <span style={styles.requiredAsterisk}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                style={styles.readOnlyInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Location / Address <span style={styles.requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your current location"
                style={styles.input}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={styles.submitBtn} 
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#1b4332';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2d6a4f';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
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
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    margin: '0 0 6px 0',
    color: '#1b4332',
    fontSize: '1.8rem',
    fontWeight: '800'
  },
  subtitle: {
    color: '#4b5563',
    fontSize: '0.95rem',
    marginBottom: '25px',
    fontWeight: '400'
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
  readOnlyInput: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    backgroundColor: '#e9ecef',
    color: '#495057',
    outline: 'none',
    cursor: 'not-allowed',
  },
  fileInput: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: '0.8rem',
    color: '#666',
  },
  previewGrid: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  previewWrapper: {
    position: 'relative',
    width: '70px',
    height: '70px',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  removeBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#d32f2f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  sellerBox: {
    backgroundColor: '#f1f8f5',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '6px',
  },
  sellerHeader: {
    margin: '0',
    fontSize: '1.0rem',
    color: '#1b4332',
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
    transition: 'all 0.2s ease',
  },
};

export default AddProduct;