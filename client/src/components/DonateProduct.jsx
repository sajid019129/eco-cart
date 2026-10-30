import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Medicine', icon: '💊' },
  { name: 'Food', icon: '🍎' },
  { name: 'Stationery', icon: '✏️' },
  { name: 'Books', icon: '📚' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Miscellaneous', icon: '📦' }
];

const CONDITIONS = [
  { name: 'Brand New / Unopened', icon: '✨' },
  { name: 'Like New / Mint Condition', icon: '⭐' },
  { name: 'Good / Gently Used', icon: '👍' },
  { name: 'Fair / Functional', icon: '🔧' },
  { name: 'Heavily Used / Refurbished', icon: '♻️' }
];

const DonateProduct = ({ user, setProducts }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    stock: '1',
    category: '',
    condition: '',
    description: '',
    donorName: user?.name || user?.username || '',
    phone: user?.phone || '',
    email: user?.email || '',
    location: user?.address || ''
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Category Dropdown States
  const [catOpen, setCatOpen] = useState(false);
  const [catMounted, setCatMounted] = useState(false);
  const catRef = useRef(null);
  const catTimer = useRef(null);

  // Condition Dropdown States
  const [condOpen, setCondOpen] = useState(false);
  const [condMounted, setCondMounted] = useState(false);
  const condRef = useRef(null);
  const condTimer = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        if (catOpen) closeCat();
      }
      if (condRef.current && !condRef.current.contains(e.target)) {
        if (condOpen) closeCond();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [catOpen, condOpen]);

  const openCat = () => {
    if (catTimer.current) clearTimeout(catTimer.current);
    if (condOpen) closeCond();
    setCatMounted(true);
    setCatOpen(true);
  };
  const closeCat = () => {
    setCatOpen(false);
    if (catTimer.current) clearTimeout(catTimer.current);
    catTimer.current = setTimeout(() => setCatMounted(false), 180);
  };

  const openCond = () => {
    if (condTimer.current) clearTimeout(condTimer.current);
    if (catOpen) closeCat();
    setCondMounted(true);
    setCondOpen(true);
  };
  const closeCond = () => {
    setCondOpen(false);
    if (condTimer.current) clearTimeout(condTimer.current);
    condTimer.current = setTimeout(() => setCondMounted(false), 180);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMediaChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    if (mediaFiles.length + selectedFiles.length > 5) {
      setError('You can upload a maximum of 5 media files in total.');
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
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const handleRemoveMedia = (indexToRemove) => {
    URL.revokeObjectURL(mediaPreviews[indexToRemove].url);
    setMediaFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mediaFiles.length < 1 || mediaFiles.length > 5) {
      setError('Please upload at least 1 and at most 5 product photos or videos.');
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.category ||
      !formData.condition ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      setError('Please fill up all required fields and information');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('price', 0); // Donations are free (shipping fee only)
      data.append('stock', Number(formData.stock) || 1);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('description', formData.description);
      data.append('sellerName', formData.donorName || 'Generous Donor');
      data.append('sellerPhone', formData.phone || 'N/A');
      data.append('sellerEmail', formData.email || 'N/A');
      data.append('sellerAddress', formData.location);
      data.append('location', formData.location);
      data.append('isDonation', 'true');

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
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to list donation item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCatObj = CATEGORIES.find(c => c.name === formData.category);
  const selectedCondObj = CONDITIONS.find(c => c.name === formData.condition);

  return (
    <>
      <style>{`
        .eco-post-container {
          background-color: #f8f9fa;
          min-height: calc(100vh - 70px);
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .eco-post-card {
          background: #ffffff;
          padding: 34px 38px;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(27, 67, 50, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 620px;
          width: 100%;
        }

        .eco-post-title {
          margin: 0 0 6px 0;
          color: #1b4332;
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .eco-post-subtitle {
          color: #4b5563;
          font-size: 0.95rem;
          margin-bottom: 24px;
          font-weight: 400;
        }

        .eco-error-banner {
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.95rem;
          font-weight: 700;
          border: 1px solid #fca5a5;
        }

        .eco-field-box {
          position: relative;
          background: #f9fafb;
          border: 2px solid #d1d5db;
          border-radius: 10px;
          padding: 12px 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-bottom: 16px;
          overflow: visible !important;
        }

        .eco-field-box:hover {
          border-color: #2d6a4f;
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(45, 106, 79, 0.12);
        }

        .eco-field-box.has-value {
          border-color: #1b4332;
          background: #eaf4ef;
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.15);
        }

        .eco-field-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1b4332;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .eco-required {
          color: #d32f2f;
          font-weight: 800;
        }

        .eco-input-field {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 0.98rem;
          color: #1f2937;
          outline: none;
          font-weight: 600;
          padding: 0;
          margin: 0;
          font-family: inherit;
        }

        .eco-input-field::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .eco-textarea-field {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 0.98rem;
          color: #1f2937;
          outline: none;
          font-weight: 600;
          padding: 0;
          margin: 0;
          resize: vertical;
          font-family: inherit;
          min-height: 80px;
        }

        .custom-dropdown-container {
          position: relative;
          cursor: pointer;
          user-select: none;
        }

        .custom-dropdown-container.is-active-dropdown {
          z-index: 99999 !important;
        }

        .custom-trigger-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-size: 0.98rem;
          color: #1f2937;
          font-weight: 600;
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
        }

        .custom-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #2d6a4f;
          background: rgba(45, 106, 79, 0.08);
          transition: transform 0.25s ease, background-color 0.2s ease, color 0.2s ease;
        }

        .custom-arrow.is-open {
          transform: rotate(180deg);
          background: #1b4332;
          color: #ffffff;
        }

        .custom-dropdown-menu {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 10px);
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 14px 36px rgba(27, 67, 50, 0.25), 0 3px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #d8eddf;
          overflow-y: auto;
          z-index: 999999;
          padding: 6px;
          transform-origin: top center;
          max-height: 260px;
        }

        .custom-dropdown-menu.open {
          animation: dropdownEnter 0.22s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .custom-dropdown-menu.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }

        @keyframes dropdownEnter {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes dropdownExit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-7px) scale(0.97); }
        }

        .custom-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px;
          margin: 2px 0;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.93rem;
          font-weight: 650;
          color: #34463b;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .custom-dropdown-item:hover {
          background: #edf7f0;
          border-color: #b7e4c7;
          color: #1b4332;
          padding-left: 18px;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(27, 67, 50, 0.08);
        }

        .custom-dropdown-item.selected {
          background: #1b4332;
          color: #ffffff;
          border-color: #1b4332;
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.2);
        }

        .eco-seller-section {
          background: #f1f8f5;
          border: 1.5px solid #c8e6c9;
          border-radius: 12px;
          padding: 18px;
          margin-top: 10px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.04);
        }

        .eco-seller-title {
          margin: 0 0 14px 0;
          font-size: 1.1rem;
          color: #1b4332;
          font-weight: 700;
        }

        .eco-submit-btn {
          width: 100%;
          background-color: #2d6a4f;
          color: #ffffff;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(45, 106, 79, 0.2);
          margin-top: 6px;
        }

        .eco-submit-btn:hover {
          background-color: #1b4332;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.3);
        }

        .eco-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="eco-post-container">
        <div className="eco-post-card">
          <h2 className="eco-post-title">Donate an Item ❤️</h2>
          <p className="eco-post-subtitle">Contribute items for community donation. Recipients only pay the shipping fee!</p>

          {error && <div className="eco-error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className={`eco-field-box ${formData.title ? 'has-value' : ''}`}>
              <label className="eco-field-label">
                <span>🏷️</span> Item Title <span className="eco-required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter item title for donation"
                className="eco-input-field"
                required
              />
            </div>

            {/* Notice for Free Price */}
            <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#1b4332', fontSize: '0.9rem', fontWeight: '600' }}>
              💡 <strong>Donation Notice:</strong> The item price is automatically set to ৳0. Anyone who claims this item will only pay the standard shipping fee.
            </div>

            {/* Category Dropdown */}
            <div 
              className={`eco-field-box custom-dropdown-container ${formData.category ? 'has-value' : ''} ${catOpen ? 'is-active-dropdown' : ''}`}
              ref={catRef}
              onClick={catOpen ? closeCat : openCat}
            >
              <label className="eco-field-label">
                <span>📂</span> Category <span className="eco-required">*</span>
              </label>
              <div className="custom-trigger-display">
                <span style={{ color: formData.category ? '#1f2937' : '#9ca3af' }}>
                  {selectedCatObj ? `${selectedCatObj.icon} ${selectedCatObj.name}` : 'Select category'}
                </span>
                <span className={`custom-arrow ${catOpen ? 'is-open' : ''}`}>▾</span>
              </div>

              {catMounted && (
                <div className={`custom-dropdown-menu ${catOpen ? 'open' : 'closing'}`}>
                  {CATEGORIES.map((cat, idx) => {
                    const isSelected = formData.category === cat.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, category: cat.name });
                          closeCat();
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Condition Dropdown */}
            <div 
              className={`eco-field-box custom-dropdown-container ${formData.condition ? 'has-value' : ''} ${condOpen ? 'is-active-dropdown' : ''}`}
              ref={condRef}
              onClick={condOpen ? closeCond : openCond}
            >
              <label className="eco-field-label">
                <span>⭐</span> Item Condition <span className="eco-required">*</span>
              </label>
              <div className="custom-trigger-display">
                <span style={{ color: formData.condition ? '#1f2937' : '#9ca3af' }}>
                  {selectedCondObj ? `${selectedCondObj.icon} ${selectedCondObj.name}` : 'Select condition'}
                </span>
                <span className={`custom-arrow ${condOpen ? 'is-open' : ''}`}>▾</span>
              </div>

              {condMounted && (
                <div className={`custom-dropdown-menu ${condOpen ? 'open' : 'closing'}`}>
                  {CONDITIONS.map((cond, idx) => {
                    const isSelected = formData.condition === cond.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, condition: cond.name });
                          closeCond();
                        }}
                      >
                        <span>{cond.icon}</span>
                        <span>{cond.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <div className={`eco-field-box ${formData.description ? 'has-value' : ''}`} style={{ height: 'auto', minHeight: '110px' }}>
              <label className="eco-field-label">
                <span>📝</span> Description <span className="eco-required">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item you wish to donate"
                className="eco-textarea-field"
                required
              />
            </div>

            {/* Media Upload */}
            <div className="eco-field-box" style={{ height: 'auto' }}>
              <label className="eco-field-label">
                <span>📸</span> Item Photos or Videos (1 to 5 Files, Max 100 MB) <span className="eco-required">*</span>
              </label>
              <div style={{ marginTop: '6px' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaChange}
                  style={{ width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                  disabled={mediaFiles.length >= 5}
                />
              </div>
              <small style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px', display: 'block' }}>
                Upload between 1 and 5 clear files ({mediaFiles.length}/5 selected). Videos must be below 100 MB.
              </small>

              {mediaPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {mediaPreviews.map((media, index) => (
                    <div key={index} style={{ position: 'relative', width: '70px', height: '70px' }}>
                      {media.type === 'video' ? (
                        <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }} muted />
                      ) : (
                        <img src={media.url} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        style={{
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
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Donor Contact Details */}
            <div className="eco-seller-section">
              <h3 className="eco-seller-title">Donor Contact Details</h3>

              <div className={`eco-field-box ${formData.donorName ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>👤</span> Full Name <span className="eco-required">*</span>
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="eco-input-field"
                  required
                />
              </div>

              <div className={`eco-field-box ${formData.phone ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>📞</span> Phone Number <span className="eco-required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="eco-input-field"
                  required
                />
              </div>

              <div className={`eco-field-box ${formData.email ? 'has-value' : ''}`}>
                <label className="eco-field-label">
                  <span>✉️</span> Email Address <span className="eco-required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="eco-input-field"
                  required
                />
              </div>

              <div className={`eco-field-box ${formData.location ? 'has-value' : ''}`} style={{ marginBottom: 0 }}>
                <label className="eco-field-label">
                  <span>📍</span> Pickup Location / Address <span className="eco-required">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter pickup address"
                  className="eco-input-field"
                  required
                />
              </div>
            </div>

            <button type="submit" className="eco-submit-btn" disabled={loading}>
              {loading ? 'Submitting Donation...' : 'Post Donation Item'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DonateProduct;