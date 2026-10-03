import React, { useState, useEffect } from 'react';

const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const currentUserId = currentUser ? (currentUser.id || currentUser._id) : null;

  const categories = [
    'All',
    'Clothes',
    'Electronics',
    'Electronics (Phone/Laptop)',
    'Books',
    'Stationery',
    'Food',
    'Medicine',
    'Miscellaneous'
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/products';
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    if (!currentUserId) {
      alert('Please login to add items to your cart.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, productId, quantity: 1 })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to add to cart');
        return;
      }

      setMessage('Item added to cart!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Error adding item to cart');
    }
  };

  const handleRestock = async (product) => {
    const newStockStr = prompt('Enter new stock quantity for restock:', '5');
    if (!newStockStr) return;
    const newStock = Number(newStockStr);
    if (isNaN(newStock) || newStock < 0) {
      alert('Invalid stock amount');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to restock item');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  return (
    <div className="container">
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search items for sale..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="category-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${ (selectedCategory === cat || (cat === 'All' && !selectedCategory)) ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading marketplace items...</p>
      ) : products.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const isSoldOut = product.stock <= 0;
            const sellerId = product.seller ? (product.seller._id || product.seller) : null;
            const isOwner = currentUserId && sellerId && currentUserId.toString() === sellerId.toString();

            let discountPercent = null;
            if (product.originalPrice && product.originalPrice > product.price) {
              discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            }

            const displayImg = product.images && product.images.length > 0 && product.images[0].trim() !== ''
              ? product.images[0]
              : 'https://via.placeholder.com/300x200?text=No+Image';

            return (
              <div key={product._id} className={`product-card ${isSoldOut ? 'sold-out' : ''}`}>
                {isSoldOut && <div className="sold-out-badge">SOLD OUT</div>}
                {!isSoldOut && discountPercent && <div className="discount-badge">-{discountPercent}%</div>}

                <div className="product-image-gallery">
                  <img src={displayImg} alt={product.title} className="product-main-img" />
                  {product.images && product.images.length > 1 && (
                    <div className="image-counter-badge">📷 1/{product.images.length}</div>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <div className="product-category">
                    {product.category ? product.category.name || product.category : 'General'}
                  </div>

                  <span className="condition-tag">{product.condition || 'Gently Used'}</span>

                  <div className="price-container">
                    <span className="current-price">${product.price.toFixed(2)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="seller-info">
                    Seller: {product.seller ? product.seller.name || 'Community Member' : 'Anonymous'}
                  </div>

                  <div className="card-actions">
                    {isOwner ? (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleRestock(product)}>
                          {isSoldOut ? 'Restock' : 'Update Stock'} ({product.stock})
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDeleteProduct(product._id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        className={`btn btn-block ${isSoldOut ? 'btn-disabled' : 'btn-primary'}`}
                        disabled={isSoldOut}
                        onClick={() => handleAddToCart(product._id)}
                      >
                        {isSoldOut ? 'Sold Out' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;