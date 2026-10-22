import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductSearch from '../components/ProductSearch';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const getCategoryName = (category) => {
  if (!category) return 'Miscellaneous';
  if (typeof category === 'object') {
    return category?.name || category?.title || 'Miscellaneous';
  }
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

function ProductImageCarousel({ product, catName, isSoldOut }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const mediaList = [];
  if (product.image) mediaList.push(product.image);
  if (Array.isArray(product.images)) mediaList.push(...product.images);
  
  return (
    <div style={prodStyles.cardHeaderImageContainer}>
      {mediaList.length > 0 ? (
        <img src={mediaList[activeIdx]} alt={product.title} style={prodStyles.cardHeaderImg} />
      ) : (
        <div style={prodStyles.noImageFallback}>📷</div>
      )}
      <div style={prodStyles.cardHeaderOverlay}>
        <span style={prodStyles.categoryBadge}>{getCategoryIcon(product.category)} {catName}</span>
        {isSoldOut && <span style={prodStyles.soldOutBadge}>Sold out</span>}
      </div>
    </div>
  );
}

function Home({ user, cart, onAddToCart, onViewDetails, featuredProducts }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');

  const handleFilterChange = ({ searchTerm: nextSearchTerm, location, category, priceRange } = {}) => {
    if (nextSearchTerm !== undefined) setSearchTerm(nextSearchTerm || '');
    if (location !== undefined) setLocationQuery(location || '');
    if (category !== undefined) setSelectedCategory(category || 'All');
    if (priceRange !== undefined) setSelectedPriceRange(priceRange || 'All Prices');
  };

  const handleCategorySelect = (cat) => setSelectedCategory(cat);

  const filteredHomeProducts = featuredProducts.filter((item) => {
    if (!item) return false;
    const itemCat = getCategoryName(item.category).toLowerCase();
    const category = selectedCategory.toLowerCase();
    const matchesCat = selectedCategory === 'All' || itemCat === category || itemCat.includes(category);
    const matchesSearch = !searchTerm.trim() || (item.title && item.title.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    const itemLocation = (item.location || item.sellerAddress || item.address || '').toLowerCase();
    const matchesLocation = !locationQuery.trim() || itemLocation.includes(locationQuery.trim().toLowerCase());
    const price = Number(item.price || 0);
    let matchesPrice = true;
    if (selectedPriceRange === 'Below 1000') matchesPrice = price < 1000;
    else if (selectedPriceRange === '1000-5000') matchesPrice = price >= 1000 && price <= 5000;
    else if (selectedPriceRange === '5000-10000') matchesPrice = price >= 5000 && price <= 10000;
    else if (selectedPriceRange === '10000-25000') matchesPrice = price >= 10000 && price <= 25000;
    else if (selectedPriceRange === '25000-50000') matchesPrice = price >= 25000 && price <= 50000;
    else if (selectedPriceRange === '50000-75000') matchesPrice = price >= 50000 && price <= 75000;
    else if (selectedPriceRange === '75000-100000') matchesPrice = price >= 75000 && price <= 100000;
    else if (selectedPriceRange === 'Above 100000') matchesPrice = price > 100000;
    return matchesCat && matchesSearch && matchesLocation && matchesPrice;
  });

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
                <Link to="/products" style={styles.primaryBtn}>
                  Explore Products 🛒
                </Link>
                <Link to="/add-product" style={styles.secondaryBtn}>
                  Post a Product for Sale 📦
                </Link>
              </div>
            </div>
          ) : (
            <div style={styles.ctaBox}>
              <p style={styles.authPrompt}>Join our marketplace to purchase or sell sustainable goods!</p>
              <div style={styles.btnGroup}>
                <Link to="/login" style={styles.primaryBtn}>
                  Login to Your Account
                </Link>
                <Link to="/register" style={styles.secondaryBtn}>
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <ProductSearch
          selectedCategory={selectedCategory}
          selectedPriceRange={selectedPriceRange}
          searchTerm={searchTerm}
          locationTerm={locationQuery}
          onCategoryChange={handleCategorySelect}
          onSearch={handleFilterChange}
          onSearchTermChange={setSearchTerm}
          onLocationChange={setLocationQuery}
          onPriceRangeChange={setSelectedPriceRange}
        />
      </div>

      <section style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ margin: 0, color: '#1b4332' }}>{selectedCategory === 'All' ? 'Trending Resell & Declutter Goods' : `${selectedCategory} Goods`}</h2>
          <Link to="/products" style={styles.viewAll}>
            View All Products →
          </Link>
        </div>

        <div style={styles.grid}>
          {filteredHomeProducts.length > 0 ? (
            filteredHomeProducts.map((p) => {
              const catName = getCategoryName(p.category);
              const originalStock = p.stock ?? 1;
              const displayStock = Math.max(0, originalStock);
              const isSoldOut = displayStock <= 0;
              const currentPrice = Number(p.price || 0);

              return (
                <div key={p._id} style={{ ...styles.card, ...(isSoldOut ? styles.soldOutCard : {}) }}>
                  <ProductImageCarousel product={p} catName={catName} isSoldOut={isSoldOut} />
                  
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{p.title}</h3>
                    <div style={styles.priceRow}>
                      <span style={styles.price}>৳{currentPrice}</span>
                      <span style={{ ...styles.stockText, color: isSoldOut ? '#d32f2f' : '#2e7e32', marginLeft: 'auto' }}>
                        {isSoldOut ? 'Out of Stock' : `Stock: ${displayStock}`}
                      </span>
                    </div>
                    <button onClick={() => onViewDetails(p)} style={styles.buyBtn}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>No products found matching your filter criteria on Home.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLocationQuery('');
                  setSelectedCategory('All');
                  setSelectedPriceRange('All Prices');
                }}
                style={{
                  backgroundColor: '#1b4332',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d6a4f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1b4332';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🗑️ Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' },
  hero: { background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', color: '#ffffff', padding: '25px 20px 20px 20px', textAlign: 'center' },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  heroTitle: { fontSize: '3.2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '1px' },
  heroSubtitle: { fontSize: '1.8rem', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '16px', color: '#d8f3dc' },
  ctaBox: { backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(6px)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'inline-block', width: '100%', maxWidth: '600px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  userBadgeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' },
  heroAvatar: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #52b788' },
  userGreeting: { fontSize: '1.2rem', color: '#ffffff', margin: 0 },
  authPrompt: { fontSize: '1.05rem', color: '#e9ecef', marginBottom: '20px' },
  btnGroup: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { backgroundColor: 'transparent', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', border: '2px solid #52b788', cursor: 'pointer' },
  secondaryBtn: { backgroundColor: 'transparent', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', border: '2px solid #52b788', cursor: 'pointer' },
  productsSection: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  viewAll: { color: '#2d6a4f', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#ffffff', borderRadius: '10px', overflow: 'hidden', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  soldOutCard: { backgroundColor: '#f0f0f0', opacity: 0.75 },
  cardBody: { padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  cardTitle: { fontSize: '1.15rem', margin: '0 0 8px 0', color: '#2b2b2b' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' },
  price: { fontSize: '1.25rem', fontWeight: 'bold', color: '#2d6a4f' },
  stockText: { fontSize: '0.85rem', fontWeight: 'bold' },
  buyBtn: { backgroundColor: '#1b4332', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: 'auto' },
  emptyState: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  emptyStateText: { fontSize: '1.1rem', color: '#495057', marginBottom: '15px', textAlign: 'center' }
};

const prodStyles = {
  cardHeaderImageContainer: { height: '190px', width: '100%', position: 'relative', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardHeaderImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noImageFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', fontSize: '2rem' },
  cardHeaderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)' },
  categoryBadge: { backgroundColor: 'rgba(27, 67, 50, 0.85)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' },
  soldOutBadge: { backgroundColor: '#d32f2f', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', marginLeft: 'auto' }
};

export default Home;