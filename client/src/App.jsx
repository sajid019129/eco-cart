import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import AddProduct from './components/AddProduct';
import Cart from './components/Cart';
import Login from './pages/Login';
import Register from './pages/Register';

const getCategoryName = (category) => {
  if (!category) return 'Miscellaneous';
  if (typeof category === 'object') return category.name || 'Miscellaneous';
  return String(category);
};

const getCategoryIcon = (category) => {
  const catName = getCategoryName(category).toLowerCase();
  if (catName.includes('medicine')) return '💊';
  if (catName.includes('food')) return '🍎';
  if (catName.includes('electronic') || catName.includes('phone') || catName.includes('laptop')) return '💻';
  if (catName.includes('stationery')) return '✏️';
  if (catName.includes('book')) return '📚';
  return '📦';
};

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Daraz-Style Notification Toast
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
          <h1 style={styles.heroTitle}>Eco-Cart 🌿</h1>
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
              return (
                <div key={p._id} style={styles.card}>
                  <div style={styles.imagePlaceholder}>
                    {getCategoryIcon(p.category)} {catName}
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{p.title}</h3>
                    <p style={styles.cardDesc}>
                      {p.description ? p.description.substring(0, 60) + '...' : 'No description provided.'}
                    </p>
                    <div style={styles.cardFooter}>
                      <span style={styles.price}>${p.price}</span>
                      <span style={styles.rating}>🌱 {p.ecoRating || 5}/5 Eco</span>
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

  // Standard category list matching database category strings exactly
  const categories = [
    'All',
    'Medicine',
    'Food',
    'Electronics',
    'Stationery',
    'Books',
    'Miscellaneous'
  ];

  const fetchProducts = async (catFilter = selectedCategory, searchFilter = searchQuery) => {
    try {
      const params = {};
      if (searchFilter.trim()) {
        params.search = searchFilter.trim();
      }
      if (catFilter && catFilter !== 'All') {
        params.category = catFilter;
      }
      const res = await axios.get('http://localhost:5000/api/products', { params });
      
      // Client-side fallback filter to strictly guarantee non-matching items are excluded
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

  return (
    <div style={prodStyles.pageWrapper}>
      <section style={prodStyles.headerBanner}>
        <div style={prodStyles.bannerContent}>
          <h2 style={prodStyles.bannerTitle}>Explore Eco-Cart Marketplace 🛍️</h2>
          <p style={prodStyles.bannerSubtitle}>Browse sustainable and decluttered items directly from sellers.</p>
        </div>
      </section>

      <div style={prodStyles.mainContainer}>
        <form onSubmit={handleSearchSubmit} style={prodStyles.searchCard}>
          <div style={prodStyles.searchGroup}>
            <input
              type="text"
              placeholder="Search electronics, books, stationery..."
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
              return (
                <div key={p._id} style={prodStyles.productCard}>
                  <div style={prodStyles.cardHeaderImage}>
                    <span style={prodStyles.categoryBadge}>
                      {getCategoryIcon(p.category)} {catName}
                    </span>
                  </div>
                  <div style={prodStyles.cardBody}>
                    <h4 style={prodStyles.itemTitle}>{p.title}</h4>
                    <p style={prodStyles.itemDesc}>
                      {p.description ? p.description.substring(0, 75) + '...' : 'No description available.'}
                    </p>
                    <div style={prodStyles.itemMeta}>
                      <span style={prodStyles.priceTag}>${p.price}</span>
                      <span style={prodStyles.ecoTag}>🌱 {p.ecoRating || 5}/5 Eco</span>
                    </div>

                    <div style={prodStyles.actionButtonGroup}>
                      <button 
                        onClick={() => handleAddToCart(p)} 
                        style={prodStyles.addToCartBtn}
                      >
                        Add to Cart 🛒
                      </button>
                      <button 
                        onClick={() => handleBuyNow(p)} 
                        style={prodStyles.buyNowBtn}
                      >
                        Buy Now ⚡
                      </button>
                    </div>

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
  },
  imagePlaceholder: {
    height: '150px',
    backgroundColor: '#d8f3dc',
    color: '#1b4332',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    gap: '8px',
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
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  price: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  rating: {
    fontSize: '0.9rem',
    color: '#e76f51',
    fontWeight: 'bold',
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
  },
  cardHeaderImage: {
    height: '140px',
    backgroundColor: '#d8f3dc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  priceTag: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  ecoTag: {
    fontSize: '0.85rem',
    color: '#2b9348',
    fontWeight: 'bold',
    backgroundColor: '#f0fff4',
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