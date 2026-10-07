import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import AddProduct from './components/AddProduct';
import Cart from './components/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

const getCategoryName = (category) => {
  if (!category) return 'Miscellaneous';
  if (typeof category === 'object') return category.name || 'Miscellaneous';
  return String(category);
};

const getCategoryIcon = (category) => {
  const catName = getCategoryName(category).toLowerCase();
  if (catName.includes('medicine')) return '💊';
  if (catName.includes('food')) return '🍎';
  if (catName.includes('electronic')) return '💻';
  if (catName.includes('stationery')) return '✏️';
  if (catName.includes('book')) return '📚';
  if (catName.includes('clothing')) return '👕';
  return '📦';
};

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const NotificationToast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div style={toastStyles.toast}>
      <div style={toastStyles.iconBox}>✓</div>
      <div style={toastStyles.textBox}>
        <strong>Added to Cart</strong>
        <span style={toastStyles.itemTitle}>{message}</span>
      </div>
      <button onClick={onClose} style={toastStyles.closeBtn}>×</button>
    </div>
  );
};

function Home({ user }) {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setFeaturedProducts(res.data.slice(0, 6)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Eco-Cart 🛍️</h1>
          <p style={styles.heroSubtitle}>From Surplus To Sustainable</p>
          
          {user ? (
            <div style={styles.ctaBox}>
              <div style={styles.userBadgeHeader}>
                <img 
                  src={user.avatar || DEFAULT_AVATAR} 
                  alt="User Profile" 
                  style={styles.heroAvatar} 
                />
                <p style={styles.userGreeting}>
                  Welcome back, <strong>{user.name || user.username || 'User'}</strong>!
                </p>
              </div>
              <div style={styles.btnGroup}>
                <Link to="/products" style={styles.primaryBtn}>Explore Products 🛒</Link>
                <Link to="/add-product" style={styles.secondaryBtn}>Post a Product for Sale 📦</Link>
              </div>
            </div>
          ) : (
            <div style={styles.ctaBox}>
              <p style={styles.authPrompt}>Join our marketplace to purchase or sell sustainable goods!</p>
              <div style={styles.btnGroup}>
                <Link to="/login" style={styles.primaryBtn}>Login to Your Account</Link>
                <Link to="/register" style={styles.secondaryBtn}>Create New Account</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ margin: 0, color: '#1b4332' }}>Trending Resell & Declutter Goods</h2>
          <Link to="/products" style={styles.viewAll}>View All Products →</Link>
        </div>

        <div style={styles.grid}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((p) => {
              const catName = getCategoryName(p.category);
              const isSoldOut = (p.stock === undefined || p.stock === null) ? false : p.stock <= 0;
              
              const currentPrice = Number(p.price || 0);
              const previousPrice = Number(p.originalPrice || p.previousPrice || 0);
              const hasDiscount = previousPrice > currentPrice;
              const discountPercent = hasDiscount
                ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
                : 0;

              return (
                <div key={p._id} style={{ ...styles.card, ...(isSoldOut ? styles.soldOutCard : {}) }}>
                  <div style={styles.imagePlaceholder}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getCategoryIcon(p.category)} {catName}
                      {p.condition && (
                        <span style={styles.conditionTagHeader}>{p.condition}</span>
                      )}
                    </div>
                    {isSoldOut && <span style={styles.soldOutBadge}>Sold out</span>}
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{p.title}</h3>
                    <p style={styles.cardDesc}>
                      {p.description || 'No description provided.'}
                    </p>

                    <div style={styles.priceRow}>
                      <span style={styles.price}>৳{currentPrice}</span>

                      {hasDiscount && (
                        <>
                          <span style={styles.strikethroughPrice}>
                            ৳{previousPrice}
                            <span style={styles.diagonalCutLine} />
                          </span>
                          <span style={styles.discountBadge}>
                            {discountPercent}% discount!
                          </span>
                        </>
                      )}

                      <span style={{ ...styles.stockText, color: isSoldOut ? '#d32f2f' : '#2e7d32', marginLeft: 'auto' }}>
                        {isSoldOut ? 'Out of Stock' : `Remaining Stock: ${p.stock ?? 1}`}
                      </span>
                    </div>

                    <button 
                      onClick={() => navigate('/products')} 
                      style={styles.buyBtn}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>No products available yet. Be the first seller to list an item!</p>
              <Link to={user ? "/add-product" : "/login"} style={styles.primaryBtn}>
                {user ? "+ Sell an Item" : "+ Login to Sell Items"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductsPage({ user, onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Restock & Edit Modal states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState('');

  const categories = [
    'All',
    'Medicine',
    'Food',
    'Electronics',
    'Stationery',
    'Books',
    'Clothing',
    'Miscellaneous'
  ];

  const fetchProducts = async (catFilter = selectedCategory, searchFilter = searchQuery) => {
    try {
      const params = {};
      if (searchFilter.trim()) {
        params.searchTerm = searchFilter.trim();
      }
      if (catFilter && catFilter !== 'All') {
        params.category = catFilter;
      }
      const res = await axios.get('http://localhost:5000/api/products', { params });
      
      let filtered = res.data;
      if (catFilter && catFilter !== 'All') {
        filtered = filtered.filter((item) => {
          const itemCat = getCategoryName(item.category).toLowerCase();
          return itemCat.includes(catFilter.toLowerCase());
        });
      }
      if (searchFilter.trim()) {
        filtered = filtered.filter((item) =>
          item.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }

      setProducts(filtered);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchProducts('All', '');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(selectedCategory, searchQuery);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    fetchProducts(cat, searchQuery);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    onAddToCart(product);
  };

  const handleBuyNow = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    onAddToCart(product, true);
    navigate('/cart');
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditStock(product.stock ?? 1);
    setEditPrice(Math.round(product.price ?? 0));
    setEditOriginalPrice(
      product.originalPrice || product.previousPrice 
        ? Math.round(product.originalPrice || product.previousPrice) 
        : ''
    );
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        stock: Number(editStock),
        price: Math.round(Number(editPrice)),
        originalPrice: editOriginalPrice ? Math.round(Number(editOriginalPrice)) : null
      };

      const res = await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, payload);
      setProducts(products.map(p => p._id === res.data._id ? res.data : p));
      setEditingProduct(null);
    } catch (err) {
      alert('Failed to update product details.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const currentUserId = user?.id || user?._id;

  return (
    <div style={prodStyles.pageWrapper}>
      <section style={prodStyles.headerBanner}>
        <div style={prodStyles.bannerContent}>
          <h2 style={prodStyles.bannerTitle}>Explore Eco-Cart Marketplace 🛍️</h2>
          <p style={prodStyles.bannerSubtitle}>Browse sustainable and decluttered items directly from sellers</p>
        </div>
      </section>

      <div style={prodStyles.mainContainer}>
        <form onSubmit={handleSearchSubmit} style={prodStyles.searchCard}>
          <div style={prodStyles.searchGroup}>
            <input
              type="text"
              placeholder="Search electronics, books, stationery, clothing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={prodStyles.searchInput}
            />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              style={prodStyles.categorySelect}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit" style={prodStyles.searchBtn}>
              Search Products
            </button>
          </div>
        </form>

        <div style={prodStyles.pillContainer}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              style={{
                ...prodStyles.pill,
                backgroundColor: selectedCategory === cat ? '#2d6a4f' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#2d6a4f',
                borderColor: selectedCategory === cat ? '#2d6a4f' : '#b7e4c7'
              }}
            >
              {cat === 'All' ? '✨ All' : `${getCategoryIcon(cat)} ${cat}`}
            </button>
          ))}
        </div>

        <div style={prodStyles.resultsHeader}>
          <h3 style={{ color: '#1b4332', margin: 0, fontSize: '1.4rem' }}>
            {selectedCategory === 'All' ? 'All Listed Items' : `${selectedCategory} Items`}
          </h3>
          <span style={prodStyles.countBadge}>{products.length} Products Found</span>
        </div>

        <div style={prodStyles.grid}>
          {products.length > 0 ? (
            products.map((p) => {
              const catName = getCategoryName(p.category);
              const sellerId = typeof p.seller === 'object' ? p.seller?._id : p.seller;
              const isOwner = Boolean(currentUserId && sellerId && String(currentUserId) === String(sellerId));
              const isSoldOut = p.stock <= 0;

              const currentPrice = Number(p.price || 0);
              const previousPrice = Number(p.originalPrice || p.previousPrice || 0);
              const hasDiscount = previousPrice > currentPrice;
              const discountPercent = hasDiscount
                ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
                : 0;

              return (
                <div 
                  key={p._id} 
                  style={{
                    ...prodStyles.productCard,
                    ...(isSoldOut ? prodStyles.soldOutCard : {})
                  }}
                >
                  <div style={prodStyles.cardHeaderImage}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={prodStyles.categoryBadge}>
                        {getCategoryIcon(p.category)} {catName}
                      </span>
                      {p.condition && (
                        <span style={prodStyles.conditionBadge}>
                          {p.condition}
                        </span>
                      )}
                    </div>
                    {isSoldOut && <span style={prodStyles.soldOutBadge}>Sold out</span>}
                  </div>

                  <div style={prodStyles.cardBody}>
                    <h4 style={prodStyles.itemTitle}>{p.title}</h4>
                    <p style={prodStyles.itemDesc}>
                      {p.description || 'No description available.'}
                    </p>

                    <div style={prodStyles.itemMeta}>
                      <span style={prodStyles.priceTag}>৳{currentPrice}</span>

                      {hasDiscount && (
                        <>
                          <span style={prodStyles.strikethroughPrice}>
                            ৳{previousPrice}
                            <span style={prodStyles.diagonalCutLine} />
                          </span>
                          <span style={prodStyles.discountBadge}>
                            {discountPercent}% discount!
                          </span>
                        </>
                      )}

                      <span style={{ ...prodStyles.stockBadge, color: isSoldOut ? '#d32f2f' : '#2e7d32', marginLeft: 'auto' }}>
                        {isSoldOut ? 'Out of Stock' : `Remaining Stock: ${p.stock}`}
                      </span>
                    </div>

                    {isOwner ? (
                      <div style={prodStyles.ownerBox}>
                        <p style={prodStyles.ownerNotice}>You are selling this product</p>
                        <div style={prodStyles.ownerActionGroup}>
                          <button onClick={() => handleOpenEdit(p)} style={prodStyles.editBtn}>
                            Restock / Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(p._id)} style={prodStyles.deleteBtn}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : isSoldOut ? (
                      <button disabled style={prodStyles.singleSoldOutBtn}>
                        Sold out
                      </button>
                    ) : (
                      <div style={prodStyles.actionButtonGroup}>
                        <button onClick={() => handleAddToCart(p)} style={prodStyles.addToCartBtn}>
                          Add to Cart 🛒
                        </button>
                        <button onClick={() => handleBuyNow(p)} style={prodStyles.buyNowBtn}>
                          Buy Now ⚡
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={prodStyles.emptyBox}>
              <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '15px' }}>
                No listings found matching your search.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  fetchProducts('All', '');
                }} 
                style={prodStyles.resetBtn}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render modal directly into document body */}
      {editingProduct && ReactDOM.createPortal(
        <div style={prodStyles.modalOverlay}>
          <div style={prodStyles.modal}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1b4332' }}>Restock & Manage Listing</h3>
            <form onSubmit={handleSaveEdit} style={prodStyles.modalForm}>
              <label style={prodStyles.modalLabel}>
                Stock Amount:
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  style={prodStyles.modalInput}
                  required
                />
              </label>
              <label style={prodStyles.modalLabel}>
                Selling Price in BDT (৳):
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  style={prodStyles.modalInput}
                  required
                />
              </label>
              <label style={prodStyles.modalLabel}>
                Original / Previous Price in BDT (৳):
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Leave blank if no discount"
                  value={editOriginalPrice}
                  onChange={(e) => setEditOriginalPrice(e.target.value)}
                  style={prodStyles.modalInput}
                />
              </label>
              <div style={prodStyles.modalButtons}>
                <button type="submit" style={prodStyles.saveBtn}>Save Changes</button>
                <button type="button" onClick={() => setEditingProduct(null)} style={prodStyles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-enter');
  const [toastMessage, setToastMessage] = useState('');
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('page-exit');
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === 'page-exit') {
      setDisplayLocation(location);
      setTransitionStage('page-enter');
    }
  };

  const handleAddToCart = (product, skipToast = false) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => (item._id || item.id) === (product._id || product.id));
      if (existingItem) {
        return prevCart.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    if (!skipToast) {
      setToastMessage(product.title || product.name || 'Item');
      setTimeout(() => setToastMessage(''), 3000);
    }

    if (user) {
      const userId = user.id || user._id;
      const productId = product._id || product.id;
      axios.post('http://localhost:5000/api/cart/add', { userId, productId, quantity: 1 })
        .catch(err => console.error("Database Cart Sync Error:", err));
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div>
      <Navbar user={user} setUser={setUser} cartCount={cartCount} />
      <NotificationToast message={toastMessage} onClose={() => setToastMessage('')} />
      <main 
        className={transitionStage} 
        onAnimationEnd={handleAnimationEnd} 
        key={displayLocation.pathname}
      >
        <Routes location={displayLocation}>
          <Route path="/" element={<Home user={user} />} />
          <Route 
            path="/products" 
            element={<ProductsPage user={user} onAddToCart={handleAddToCart} />} 
          />
          
          <Route 
            path="/add-product" 
            element={
              <ProtectedRoute user={user}>
                <AddProduct user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute user={user}>
                <Cart user={user} cart={cart} setCart={setCart} />
              </ProtectedRoute>
            } 
          />

          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
    </div>
  );
}

const toastStyles = {
  toast: {
    position: 'fixed',
    top: '80px',
    right: '25px',
    backgroundColor: '#ffffff',
    color: '#1b4332',
    padding: '14px 20px',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    zIndex: 9999,
    borderLeft: '5px solid #52b788',
    animation: 'slideIn 0.3s ease-out',
    maxWidth: '350px',
  },
  iconBox: {
    backgroundColor: '#d8f3dc',
    color: '#2d6a4f',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  textBox: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.9rem',
  },
  itemTitle: {
    color: '#555',
    fontSize: '0.85rem',
    marginTop: '2px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.4rem',
    color: '#999',
    cursor: 'pointer',
    marginLeft: 'auto',
  }
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  hero: {
    background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
    color: '#ffffff',
    padding: '50px 20px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3.2rem',
    fontWeight: '800',
    marginBottom: '8px',
    letterSpacing: '-1px',
  },
  heroSubtitle: {
    fontSize: '1.3rem',
    color: '#b7e4c7',
    marginBottom: '25px',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  ctaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '12px',
    backdropFilter: 'blur(5px)',
    display: 'inline-block',
  },
  userBadgeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  heroAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #52b788',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  userGreeting: {
    fontSize: '1.1rem',
    margin: 0,
  },
  authPrompt: {
    fontSize: '1.1rem',
    marginBottom: '15px',
  },
  btnGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#52b788',
    color: '#081c15',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'inline-block',
  },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    color: '#1b4332',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'inline-block',
  },
  productsSection: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  viewAll: {
    color: '#2d6a4f',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  soldOutCard: {
    backgroundColor: '#f8f8f8',
    opacity: 0.85
  },
  soldOutBadge: {
    backgroundColor: '#e63946',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    marginLeft: 'auto'
  },
  imagePlaceholder: {
    height: '150px',
    backgroundColor: '#d8f3dc',
    color: '#1b4332',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 15px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  conditionTagHeader: {
    fontSize: '0.7rem',
    backgroundColor: '#ffffff',
    color: '#2d6a4f',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  cardBody: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: '1.2rem',
    margin: '0 0 8px 0',
    color: '#2b2b2b',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '15px',
    flexGrow: 1,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '15px',
  },
  price: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  strikethroughPrice: {
    fontSize: '0.92rem',
    color: '#a0aec0',
    position: 'relative',
    display: 'inline-block',
    padding: '0 2px'
  },
  diagonalCutLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '1.5px',
    backgroundColor: '#e53e3e',
    transform: 'rotate(-15deg)',
    transformOrigin: 'center'
  },
  discountBadge: {
    backgroundColor: '#feebc8',
    color: '#c05621',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  stockText: {
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  buyBtn: {
    backgroundColor: '#1b4332',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  emptyStateText: {
    fontSize: '1.1rem',
    color: '#495057',
    marginBottom: '20px',
    textAlign: 'center',
  }
};

const prodStyles = {
  pageWrapper: {
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    paddingBottom: '60px',
  },
  headerBanner: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    padding: '40px 20px 30px 20px',
    textAlign: 'center',
  },
  bannerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  bannerTitle: {
    fontSize: '2.2rem',
    fontWeight: '700',
    marginBottom: '8px',
  },
  bannerSubtitle: {
    color: '#b7e4c7',
    fontSize: '1.05rem',
  },
  mainContainer: {
    maxWidth: '1200px',
    margin: '30px auto 0 auto',
    padding: '0 20px',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    padding: '15px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '25px',
  },
  searchGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '2 1 250px',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.98rem',
    outline: 'none',
  },
  categorySelect: {
    flex: '1 1 180px',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.98rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  searchBtn: {
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.98rem',
  },
  pillContainer: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '10px',
    marginBottom: '25px',
  },
  pill: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  countBadge: {
    backgroundColor: '#d8f3dc',
    color: '#1b4332',
    padding: '6px 14px',
    borderRadius: '15px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '25px',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e0e0e0',
    position: 'relative'
  },
  soldOutCard: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d0d0d0'
  },
  soldOutBadge: {
    backgroundColor: '#d32f2f',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    marginLeft: 'auto'
  },
  cardHeaderImage: {
    height: '140px',
    backgroundColor: '#d8f3dc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 15px',
  },
  categoryBadge: {
    backgroundColor: '#ffffff',
    color: '#1b4332',
    padding: '6px 14px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  conditionBadge: {
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  cardBody: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  itemTitle: {
    fontSize: '1.15rem',
    margin: '0 0 8px 0',
    color: '#2b2b2b',
  },
  itemDesc: {
    fontSize: '0.88rem',
    color: '#666',
    marginBottom: '15px',
    flexGrow: 1,
    lineHeight: '1.4',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '15px',
  },
  priceTag: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  strikethroughPrice: {
    fontSize: '0.9rem',
    color: '#a0aec0',
    position: 'relative',
    display: 'inline-block',
    padding: '0 2px'
  },
  diagonalCutLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '1.5px',
    backgroundColor: '#e53e3e',
    transform: 'rotate(-15deg)',
    transformOrigin: 'center'
  },
  discountBadge: {
    backgroundColor: '#feebc8',
    color: '#c05621',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  stockBadge: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  actionButtonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#2d6a4f',
    border: '1px solid #2d6a4f',
    padding: '10px 4px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '10px 4px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  singleSoldOutBtn: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    color: '#757575',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
    fontSize: '0.9rem',
    marginTop: 'auto',
  },
  disabledBtn: {
    backgroundColor: '#e0e0e0',
    color: '#9e9e9e',
    borderColor: '#e0e0e0',
    cursor: 'not-allowed'
  },
  ownerBox: {
    borderTop: '1px solid #eeeeee',
    paddingTop: '10px',
    marginTop: 'auto'
  },
  ownerNotice: {
    fontSize: '0.8rem',
    color: '#1976d2',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    textAlign: 'center'
  },
  ownerActionGroup: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#1976d2',
    color: '#ffffff',
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#d32f2f',
    color: '#ffffff',
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '10px',
    width: '350px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  modalLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '0.9rem',
    color: '#333',
    fontWeight: '600'
  },
  modalInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem'
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '10px'
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#757575',
    color: '#ffffff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  emptyBox: {
    gridColumn: '1 / -1',
    backgroundColor: '#ffffff',
    padding: '50px 20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  resetBtn: {
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
};

export default App;