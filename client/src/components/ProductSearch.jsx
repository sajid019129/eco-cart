import React, { useState } from 'react';

export const ProductPriceDisplay = ({ price, originalPrice }) => {
  const currentNum = Number(price);
  const originalNum = Number(originalPrice);
  const hasDiscount = originalPrice && !isNaN(originalNum) && originalNum > currentNum;

  const discountPercent = hasDiscount
    ? Math.round(((originalNum - currentNum) / originalNum) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1b4332' }}>
        ৳{currentNum}
      </span>

      {hasDiscount && (
        <>
          <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.95rem' }}>
            ৳{originalNum}
          </span>
          <span
            style={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
};

const ProductSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const categories = ['All', 'Medicine', 'Food', 'Electronics', 'Stationery', 'Books', 'Clothing', 'Miscellaneous'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ searchTerm, category: category === 'All' ? '' : category });
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ margin: '20px auto', maxWidth: '600px', display: 'flex', gap: '10px' }}>
      <input
        type="text"
        placeholder="Search electronics, books, stationery, clothing..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="eco-track-input"
        style={{
          flex: 1,
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          outline: 'none',
          fontSize: '0.95rem',
          backgroundColor: '#fff',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="eco-track-input"
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          outline: 'none',
          fontSize: '0.95rem',
          backgroundColor: '#fff',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer'
        }}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <button
        type="submit"
        style={{
          padding: '12px 24px',
          backgroundColor: '#2d6a4f',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1b4332';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2d6a4f';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Search
      </button>
      <style>{`
        .eco-track-input:focus {
          border-color: #2d6a4f !important;
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.15) !important;
        }
      `}</style>
    </form>
  );
};

export default ProductSearch;