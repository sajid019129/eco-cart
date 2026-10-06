import React, { useState } from 'react';

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
    <div style={{ margin: '20px auto', maxWidth: '600px', display: 'flex', gap: '10px' }}>
      <input
        type="text"
        placeholder="Search eco-friendly products..."
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
        onClick={handleSearch}
        style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Search
      </button>
    </div>
  );
};

export default ProductSearch;