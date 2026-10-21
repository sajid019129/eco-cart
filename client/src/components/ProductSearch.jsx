import React, { useState, useEffect, useRef } from 'react';

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

const getCategoryIcon = (category) => {
  const catName = (category || '').toLowerCase();
  if (catName.includes('medicine')) return '💊';
  if (catName.includes('food')) return '🍎';
  if (catName.includes('electronic')) return '💻';
  if (catName.includes('stationery')) return '✏️';
  if (catName.includes('book')) return '📚';
  if (catName.includes('clothing')) return '👕';
  if (catName.includes('all')) return '✨';
  return '📦';
};

const PRICE_RANGES = [
  'All Prices',
  'Below 1000',
  '1000-5000',
  '5000-10000',
  '10000-25000',
  '25000-50000',
  '50000-75000',
  '75000-100000',
  'Above 100000'
];

const formatPriceDisplay = (range) => {
  if (range === 'All Prices') return 'All Prices';
  if (range.startsWith('Below ')) {
    return `Below ৳${range.replace('Below ', '')}`;
  }
  if (range.startsWith('Above ')) {
    return `Above ৳${range.replace('Above ', '')}`;
  }
  if (range.includes('-')) {
    const [min, max] = range.split('-');
    return `৳${min} - ৳${max}`;
  }
  return range;
};

const ProductSearch = ({ onSearch, selectedCategory = 'All', onCategoryChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [categories, setCategories] = useState(['All', 'Medicine', 'Food', 'Electronics', 'Stationery', 'Books', 'Clothing', 'Miscellaneous']);

  // Custom Category Dropdown State
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catDropdownMounted, setCatDropdownMounted] = useState(false);
  const catDropdownRef = useRef(null);
  const catCloseTimerRef = useRef(null);

  // Custom Price Dropdown State
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [priceDropdownMounted, setPriceDropdownMounted] = useState(false);
  const priceDropdownRef = useRef(null);
  const priceCloseTimerRef = useRef(null);

  const openCatDropdown = () => {
    if (catCloseTimerRef.current) clearTimeout(catCloseTimerRef.current);
    if (priceDropdownOpen) closePriceDropdown();
    setCatDropdownMounted(true);
    setCatDropdownOpen(true);
  };

  const closeCatDropdown = () => {
    setCatDropdownOpen(false);
    if (catCloseTimerRef.current) clearTimeout(catCloseTimerRef.current);
    catCloseTimerRef.current = setTimeout(() => {
      setCatDropdownMounted(false);
      catCloseTimerRef.current = null;
    }, 180);
  };

  const toggleCatDropdown = () => {
    if (catDropdownOpen) closeCatDropdown();
    else openCatDropdown();
  };

  const openPriceDropdown = () => {
    if (priceCloseTimerRef.current) clearTimeout(priceCloseTimerRef.current);
    if (catDropdownOpen) closeCatDropdown();
    setPriceDropdownMounted(true);
    setPriceDropdownOpen(true);
  };

  const closePriceDropdown = () => {
    setPriceDropdownOpen(false);
    if (priceCloseTimerRef.current) clearTimeout(priceCloseTimerRef.current);
    priceCloseTimerRef.current = setTimeout(() => {
      setPriceDropdownMounted(false);
      priceCloseTimerRef.current = null;
    }, 180);
  };

  const togglePriceDropdown = () => {
    if (priceDropdownOpen) closePriceDropdown();
    else openPriceDropdown();
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const catNames = data.map(c => c.name || c);
          setCategories(['All', ...catNames]);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target)) {
        if (catDropdownOpen) closeCatDropdown();
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        if (priceDropdownOpen) closePriceDropdown();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (catDropdownOpen) closeCatDropdown();
        if (priceDropdownOpen) closePriceDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (catCloseTimerRef.current) clearTimeout(catCloseTimerRef.current);
      if (priceCloseTimerRef.current) clearTimeout(priceCloseTimerRef.current);
    };
  }, [catDropdownOpen, priceDropdownOpen]);

  // Pass all filters back whenever any of them change
  useEffect(() => {
    if (onSearch) {
      onSearch({
        searchTerm,
        location: locationTerm,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        priceRange: selectedPriceRange
      });
    }
  }, [searchTerm, locationTerm, selectedCategory, selectedPriceRange, onSearch]);

  const handleSelectCategory = (cat) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
    closeCatDropdown();
  };

  const handleSelectPrice = (range) => {
    setSelectedPriceRange(range);
    closePriceDropdown();
  };

  return (
    <>
      <style>{`
        .search-filter-container {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          background: #ffffff;
          padding: 22px;
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(27, 67, 50, 0.08);
          border: 1px solid #e5e7eb;
          margin: 20px auto;
          max-width: 1200px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          align-items: stretch;
          overflow: visible !important;
        }

        .filter-box {
          flex: 1;
          min-width: 240px;
          height: 76px;
          box-sizing: border-box;
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
          overflow: visible !important;
        }

        .filter-box:hover {
          border-color: #2d6a4f;
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(45, 106, 79, 0.12);
        }

        .filter-box.active-box {
          border-color: #1b4332;
          background: #eaf4ef;
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.2);
          transform: translateY(-2px);
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1b4332;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }

        .filter-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 28px;
        }

        .filter-input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          color: #1f2937;
          outline: none;
          font-weight: 600;
          padding: 0;
          margin: 0;
        }

        .filter-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .filter-icon {
          font-size: 1.15rem;
          color: #2d6a4f;
        }

        .clear-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          font-size: 1.25rem;
          font-weight: bold;
          padding: 0 4px;
          line-height: 1;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .clear-btn:hover {
          color: #d32f2f;
          transform: scale(1.3) rotate(90deg);
        }

        .custom-dropdown-container {
          position: relative;
          cursor: pointer;
          user-select: none;
          z-index: 100;
        }

        .custom-trigger-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 600;
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
          height: 28px;
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
          z-index: 9999;
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

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(27, 67, 50, 0.2); }
          70% { box-shadow: 0 0 0 6px rgba(27, 67, 50, 0); }
          100% { box-shadow: 0 0 0 0 rgba(27, 67, 50, 0); }
        }

        .active-pulse {
          animation: pulseGlow 2s infinite;
        }
      `}</style>

      <div className="search-filter-container">
        {/* BOX 01: Filter by Price Box (First) */}
        <div 
          className={`filter-box custom-dropdown-container ${selectedPriceRange !== 'All Prices' ? 'active-box active-pulse' : ''}`}
          ref={priceDropdownRef}
          onClick={togglePriceDropdown}
        >
          <span className="filter-label">
            <span className="filter-icon">💵</span> FILTER BY PRICE
          </span>
          <div className="custom-trigger-display">
            <span>
              {selectedPriceRange === 'All Prices' ? '✨ All Prices' : `💵 ${formatPriceDisplay(selectedPriceRange)}`}
            </span>
            <span className={`custom-arrow ${priceDropdownOpen ? 'is-open' : ''}`}>
              ▾
            </span>
          </div>

          {priceDropdownMounted && (
            <div className={`custom-dropdown-menu ${priceDropdownOpen ? 'open' : 'closing'}`}>
              {PRICE_RANGES.map((range, idx) => {
                const isSelected = selectedPriceRange === range;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPrice(range);
                    }}
                  >
                    <span>{range === 'All Prices' ? '✨' : '💵'}</span>
                    <span>{range === 'All Prices' ? 'All Prices' : formatPriceDisplay(range)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* BOX 02: Filter by Category Box (Second) */}
        <div 
          className={`filter-box custom-dropdown-container ${selectedCategory !== 'All' ? 'active-box active-pulse' : ''}`}
          ref={catDropdownRef}
          onClick={toggleCatDropdown}
        >
          <span className="filter-label">
            <span className="filter-icon">🏷️</span> FILTER BY CATEGORY
          </span>
          <div className="custom-trigger-display">
            <span>{getCategoryIcon(selectedCategory)} {selectedCategory}</span>
            <span className={`custom-arrow ${catDropdownOpen ? 'is-open' : ''}`}>
              ▾
            </span>
          </div>

          {catDropdownMounted && (
            <div className={`custom-dropdown-menu ${catDropdownOpen ? 'open' : 'closing'}`}>
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCategory(cat);
                    }}
                  >
                    <span>{getCategoryIcon(cat)}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* BOX 03: Search Products Box (Third) */}
        <div className={`filter-box ${searchTerm ? 'active-box active-pulse' : ''}`}>
          <span className="filter-label">
            <span className="filter-icon">🔍</span> SEARCH PRODUCTS
          </span>
          <div className="filter-input-wrapper">
            <input
              type="text"
              className="filter-input"
              placeholder="Search by names or titles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="clear-btn"
                onClick={() => setSearchTerm('')} 
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* BOX 04: Search by Location Box (Fourth) */}
        <div className={`filter-box ${locationTerm ? 'active-box active-pulse' : ''}`}>
          <span className="filter-label">
            <span className="filter-icon">📍</span> SEARCH BY LOCATION
          </span>
          <div className="filter-input-wrapper">
            <input
              type="text"
              className="filter-input"
              placeholder="e.g. Uttara or Dhaka"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
            />
            {locationTerm && (
              <button 
                type="button" 
                className="clear-btn"
                onClick={() => setLocationTerm('')} 
                title="Clear location"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductSearch;