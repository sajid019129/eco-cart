import React, { useState } from 'react';

// Reusable component to render current price, struck-through original price, and auto-calculated discount %
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
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <button
        type="submit"
        style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Search
      </button>
    </form>
  );
};

export default ProductSearch;