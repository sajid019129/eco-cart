import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ProductSearch from './ProductSearch';
import CheckoutModal from './CheckoutModal';
import OrderSuccessModal from './OrderSuccessModal';
import InvoiceModal from './InvoiceModal';

const CATEGORIES = [
  'All',
  'Electronics',
  'Medicine',
  'Food',
  'Stationery',
  'Books',
  'Clothing',
  'Miscellaneous'
];

const getCategoryIcon = (category) => {
  const catName = (typeof category === 'object' ? category?.name : category || '').toLowerCase();
  if (catName.includes('medicine')) return '💊';
  if (catName.includes('food')) return '🍎';
  if (catName.includes('electronic')) return '💻';
  if (catName.includes('stationery')) return '✏️';
  if (catName.includes('book')) return '📚';
  if (catName.includes('clothing')) return '👕';
  return '📦';
};

const formatMediaSrc = (img) => {
  if (!img) return null;
  if (typeof img === 'object') img = img.url || img.path || img.src || null;
  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    if (trimmed.startsWith('http') || trimmed.startsWith('data:image') || trimmed.startsWith('data:video') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    if (trimmed.length > 50) {
      return `data:image/jpeg;base64,${trimmed}`;
    }
    if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
      return `http://localhost:5000/${trimmed.replace(/^\//, '')}`;
    }
    return trimmed;
  }
  return null;
};

const getProductImages = (product) => {
  if (!product) return [];
  let list = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    list = product.images.map(formatMediaSrc).filter(Boolean);
  }
  if (list.length === 0) {
    const single = formatMediaSrc(product.image || product.imageUrl || product.photo);
    if (single) list.push(single);
  }
  return list;
};

const DonationMarketplace = ({ user }) => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Checkout & Modal states
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);

  // Alert bubble for unauthenticated users clicking donate
  const [donateAlertOpen, setDonateAlertOpen] = useState(false);
  const donateAlertRef = React.useRef(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      if (Array.isArray(res.data)) {
        // Filter specifically for donation items
        const donationList = res.data.filter(p => p.isDonation === true);
        setDonations(donationList);
      }
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    }
  };

  const handleClaimNow = (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Set checkout direct item for donation (price is ৳0, only shipping fee applies)
    setCheckoutItem({
      product: item,
      quantity: 1,
      isDonationOrder: true
    });
    setIsCheckoutOpen(true);
  };

  const handleDonateClick = (e) => {
    if (!user) {
      e.preventDefault();
      setDonateAlertOpen(true);
      setTimeout(() => setDonateAlertOpen(false), 3500);
    } else {
      navigate('/donate-item');
    }
  };

  const filteredDonations = donations.filter((item) => {
    const itemCat = (typeof item.category === 'object' ? item.category?.name : item.category || 'Miscellaneous').toLowerCase();
    const matchesCat = selectedCategory === 'All' || itemCat === selectedCategory.toLowerCase() || itemCat.includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery.trim() || (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    const itemLocation = (item.location || item.sellerAddress || '').toLowerCase();
    const matchesLocation = !locationQuery.trim() || itemLocation.includes(locationQuery.trim().toLowerCase());
    return matchesCat && matchesSearch && matchesLocation;
  });

  return (
    <div style={styles.pageWrapper}>
      <section style={styles.headerBanner}>
        <div style={styles.bannerContent}>
          <h2 style={styles.bannerTitle}>Community Donation Marketplace ❤️</h2>
          <p style={styles.bannerSubtitle}>
            Give surplus items a second life or claim community donations. Recipients only pay standard shipping fees!
          </p>
          
          <div style={{ marginTop: '20px', position: 'relative', display: 'inline-block' }} ref={donateAlertRef}>
            <Link 
              to="/donate-item" 
              onClick={handleDonateClick}
              style={styles.donateActionBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#52b788';
                e.currentTarget.style.color = '#081c15';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d6a4f';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ✨ Donate an Item
            </Link>

            {donateAlertOpen && (
              <div style={styles.alertBubble}>
                Please login to donate your items
              </div>
            )}
          </div>
        </div>
      </section>

      <div style={styles.mainContainer}>
        <ProductSearch
          selectedCategory={selectedCategory}
          selectedPriceRange="All Prices"
          searchTerm={searchQuery}
          locationTerm={locationQuery}
          onCategoryChange={setSelectedCategory}
          onSearch={({ searchTerm, location, category }) => {
            if (searchTerm !== undefined) setSearchQuery(searchTerm);
            if (location !== undefined) setLocationQuery(location);
            if (category !== undefined) setSelectedCategory(category);
          }}
          onSearchTermChange={setSearchQuery}
          onLocationChange={setLocationQuery}
          onPriceRangeChange={() => {}}
        />

        <div style={styles.pillContainer}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.pill,
                  backgroundColor: isSelected ? '#2d6a4f' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#2d6a4f',
                  borderColor: isSelected ? '#2d6a4f' : '#b7e4c7'
                }}
              >
                {cat === 'All' ? '✨ All' : `${getCategoryIcon(cat)} ${cat}`}
              </button>
            );
          })}
        </div>

        <div style={styles.resultsHeader}>
          <h3 style={{ color: '#1b4332', margin: 0, fontSize: '1.4rem' }}>
            {selectedCategory === 'All' ? 'Available Donations' : `${selectedCategory} Donations`}
          </h3>
          <span style={styles.countBadge}>{filteredDonations.length} Items Available</span>
        </div>

        <div style={styles.grid}>
          {filteredDonations.length > 0 ? (
            filteredDonations.map((item) => {
              const images = getProductImages(item);
              const mainImg = images[0] || 'https://via.placeholder.com/300?text=Donation';
              const stock = item.stock ?? 1;
              const isSoldOut = stock <= 0;

              return (
                <div 
                  key={item._id} 
                  style={{ ...styles.card, ...(isSoldOut ? styles.soldOutCard : {}) }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(45, 106, 79, 0.18)';
                    e.currentTarget.style.borderColor = '#1b4332';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  <div style={styles.imgContainer}>
                    <img src={mainImg} alt={item.title} style={styles.cardImg} />
                    <div style={styles.badgeOverlay}>
                      <span style={styles.categoryBadge}>{getCategoryIcon(item.category)} Donation</span>
                      {item.condition && <span style={styles.conditionBadge}>{item.condition}</span>}
                    </div>
                  </div>

                  <div style={styles.cardBody}>
                    <h4 style={styles.itemTitle}>{item.title}</h4>
                    
                    <div style={styles.priceRow}>
                      <span style={styles.freePriceTag}>৳0 (Free Item)</span>
                      <span style={styles.shippingNotice}>+ Standard Shipping Fee</span>
                    </div>

                    <div style={styles.stockNotice}>
                      {isSoldOut ? 'Claimed / Out of Stock' : `Available Stock: ${stock}`}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDetailsItem(item)}
                      style={styles.detailsBtn}
                    >
                      View Details
                    </button>

                    {isSoldOut ? (
                      <button disabled style={styles.soldOutBtn}>Claimed</button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimNow(item)}
                        style={styles.claimBtn}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1b4332'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d6a4f'}
                      >
                        Claim / Buy Now ⚡
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyBox}>
              <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '18px', fontWeight: '600' }}>
                No donation items found matching your search.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setLocationQuery(''); setSelectedCategory('All'); }}
                style={styles.resetBtn}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && checkoutItem && (
        <CheckoutModal
          user={user}
          cart={[checkoutItem]}
          isBuyNow={true}
          isDonationCheckout={true}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutItem(null);
          }}
          onSuccess={(orderData) => {
            setCompletedOrder(orderData);
            setIsCheckoutOpen(false);
            setCheckoutItem(null);
            fetchDonations();
          }}
          showToast={(msg, type) => alert(msg)}
        />
      )}

      {/* Order Success Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onViewInvoice={() => setShowInvoice(true)}
          onBackToHome={() => {
            setCompletedOrder(null);
            navigate('/donations');
          }}
          onViewTrack={(orderNum) => {
            setCompletedOrder(null);
            navigate(`/track-order?orderId=${orderNum}`);
          }}
        />
      )}

      {/* Invoice Modal */}
      {showInvoice && completedOrder && (
        <InvoiceModal
          order={completedOrder}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    paddingBottom: '50px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  headerBanner: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    padding: '40px 20px',
    textAlign: 'center'
  },
  bannerContent: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  bannerTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '10px'
  },
  bannerSubtitle: {
    fontSize: '1.1rem',
    color: '#d8f3dc',
    margin: 0
  },
  donateActionBtn: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: '2px solid #52b788',
    padding: '10px 22px',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '1rem',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
  },
  alertBubble: {
    position: 'absolute',
    bottom: '-45px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ffffff',
    color: '#1b4332',
    padding: '6px 14px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    border: '1px solid #e5e7eb',
    fontSize: '0.85rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    zIndex: 10
  },
  mainContainer: {
    maxWidth: '1200px',
    margin: '25px auto 0 auto',
    padding: '0 20px'
  },
  pillContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '10px',
    marginBottom: '25px'
  },
  pill: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  countBadge: {
    backgroundColor: '#d8f3dc',
    color: '#1b4332',
    padding: '6px 14px',
    borderRadius: '15px',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '25px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e0e0e0',
    transition: 'all 0.25s ease'
  },
  soldOutCard: {
    backgroundColor: '#f0f0f0',
    opacity: 0.75,
    filter: 'grayscale(30%)'
  },
  imgContainer: {
    height: '190px',
    width: '100%',
    position: 'relative',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden'
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  badgeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)'
  },
  categoryBadge: {
    backgroundColor: 'rgba(27, 67, 50, 0.85)',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  conditionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1b4332',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  itemTitle: {
    fontSize: '1.1rem',
    margin: '0 0 6px 0',
    color: '#2b2b2b'
  },
  priceRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '10px'
  },
  freePriceTag: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#2d6a4f'
  },
  shippingNotice: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: '600'
  },
  stockNotice: {
    fontSize: '0.82rem',
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: '12px'
  },
  detailsBtn: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 'bold',
    width: '100%',
    marginBottom: '8px'
  },
  claimBtn: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '9px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
    width: '100%',
    marginTop: 'auto',
    transition: 'background-color 0.2s ease'
  },
  soldOutBtn: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    color: '#757575',
    border: 'none',
    padding: '9px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
    marginTop: 'auto',
    fontSize: '0.85rem'
  },
  emptyBox: {
    gridColumn: '1 / -1',
    backgroundColor: '#ffffff',
    padding: '50px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  resetBtn: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default DonationMarketplace;