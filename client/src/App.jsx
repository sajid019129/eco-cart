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

const formatImgSrc = (img) => {
  if (!img) return null;
  if (typeof img === 'object') {
    img = img.url || img.path || img.src || null;
  }
  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    if (trimmed.startsWith('http') || trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
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
    list = product.images.map(formatImgSrc).filter(Boolean);
  } else if (Array.isArray(product.photos) && product.photos.length > 0) {
    list = product.photos.map(formatImgSrc).filter(Boolean);
  }
  if (list.length === 0) {
    const single = formatImgSrc(product.image || product.imageUrl || product.photo);
    if (single) list.push(single);
  }
  return list;
};

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

const NotificationToast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  const isError = type === 'error';

  return (
    <div style={{
      ...toastStyles.toast,
      borderLeft: `5px solid ${isError ? '#d32f2f' : '#52b788'}`
    }}>
      <div style={{
        ...toastStyles.iconBox,
        backgroundColor: isError ? '#ffebee' : '#d8f3dc',
        color: isError ? '#d32f2f' : '#2d6a4f'
      }}>
        {isError ? '!' : '✓'}
      </div>
      <div style={toastStyles.textBox}>
        <strong>{isError ? 'Stock Limit Reached' : 'Added to Cart'}</strong>
        <span style={toastStyles.itemTitle}>{message}</span>
      </div>
      <button onClick={onClose} style={toastStyles.closeBtn}>×</button>
    </div>
  );
};

function ProductImageCarousel({ product, catName, isSoldOut }) {
  const images = getProductImages(product);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imgAnimClass, setImgAnimClass] = useState('img-fade-in');

  const changeImage = (newIndex) => {
    if (newIndex === activeImgIndex) return;
    setImgAnimClass('img-fade-out');
    setTimeout(() => {
      setActiveImgIndex(newIndex);
      setImgAnimClass('img-fade-in');
    }, 150);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const newIdx = activeImgIndex === 0 ? images.length - 1 : activeImgIndex - 1;
    changeImage(newIdx);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const newIdx = activeImgIndex === images.length - 1 ? 0 : activeImgIndex + 1;
    changeImage(newIdx);
  };

  const hasImages = images.length > 0;
  const currentImageSrc = hasImages ? images[activeImgIndex] : null;

  return (
    <div style={prodStyles.cardHeaderImageContainer}>
      {hasImages && currentImageSrc ? (
        <img 
          src={currentImageSrc} 
          alt={product.title || 'Product Image'} 
          className={imgAnimClass}
          style={{ ...prodStyles.cardHeaderImg, transition: 'opacity 0.15s ease-in-out' }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : (
        <div style={prodStyles.noImageFallback}>
          <span style={{ fontSize: '2.5rem', marginBottom: '4px' }}>📷</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#6b7280' }}>No Image Available</span>
        </div>
      )}

      <div style={prodStyles.cardHeaderOverlay}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={prodStyles.categoryBadge}>
            {getCategoryIcon(product.category)} {catName}
          </span>
          {product.condition && (
            <span style={prodStyles.conditionBadge}>
              {product.condition}
            </span>
          )}
        </div>
        {isSoldOut && <span style={prodStyles.soldOutBadge}>Sold out</span>}
      </div>

      {images.length > 1 && (
        <>
          <button 
            type="button" 
            onClick={prevImage} 
            style={prodStyles.arrowLeftBtn} 
            title="Previous image"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(27, 67, 50, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ❮
          </button>
          <button 
            type="button" 
            onClick={nextImage} 
            style={prodStyles.arrowRightBtn} 
            title="Next image"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(27, 67, 50, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ❯
          </button>
          <div style={prodStyles.dotsContainer}>
            {images.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  changeImage(idx);
                }}
                style={{
                  ...prodStyles.dot,
                  backgroundColor: idx === activeImgIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  transform: idx === activeImgIndex ? 'scale(1.25)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (idx !== activeImgIndex) {
                    e.currentTarget.style.transform = 'scale(1.3)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== activeImgIndex) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                  }
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({ product, displayStock, isOwner, isSoldOut, currentPrice, previousPrice, hasDiscount, discountPercent, catName, onAddToCart, onBuyNow, onOpenEdit, onDeleteProduct, onViewDetails }) {
  return (
    <div 
      style={{ ...prodStyles.productCard, ...(isSoldOut ? prodStyles.soldOutCard : {}) }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(45, 106, 79, 0.18)';
        e.currentTarget.style.borderColor = '#52b788';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = isSoldOut ? '#d0d0d0' : '#e0e0e0';
      }}
    >
      <ProductImageCarousel product={product} catName={catName} isSoldOut={isSoldOut} />

      <div style={prodStyles.cardBody}>
        <h4 style={prodStyles.itemTitle}>{product.title}</h4>

        <div style={prodStyles.itemMeta}>
          <span style={prodStyles.priceTag}>৳{currentPrice}</span>

          {hasDiscount && (
            <>
              <span style={prodStyles.strikethroughPrice}>
                ৳<span style={prodStyles.numberCutWrapper}>
                  {previousPrice}
                  <span style={prodStyles.diagonalCutLine} />
                </span>
              </span>
              <span style={prodStyles.discountBadge}>
                {discountPercent}% discount!
              </span>
            </>
          )}

          <span style={{ ...prodStyles.stockBadge, color: isSoldOut ? '#d32f2f' : '#2e7d32', marginLeft: 'auto' }}>
            {isSoldOut ? 'Out of Stock' : `Stock Available: ${displayStock}`}
          </span>
        </div>

        <button 
          type="button" 
          onClick={() => onViewDetails(product)} 
          style={prodStyles.detailsBtn}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2d6a4f'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1b4332'}
        >
          View Details
        </button>

        {isOwner ? (
          <div style={prodStyles.ownerBox}>
            <p style={prodStyles.ownerNotice}>You are selling this product</p>
            <div style={prodStyles.ownerActionGroup}>
              <button 
                onClick={() => onOpenEdit(product)} 
                style={prodStyles.editBtn}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1b4332'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2d6a4f'}
              >
                Restock / Edit
              </button>
              <button 
                onClick={() => onDeleteProduct(product._id)} 
                style={prodStyles.deleteBtn}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b71c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#d32f2f'}
              >
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
            <button 
              onClick={() => onAddToCart(product)} 
              style={prodStyles.addToCartBtn}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f1f8f5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
              }}
            >
              Add to Cart 🛒
            </button>
            <button 
              onClick={() => onBuyNow(product)} 
              style={prodStyles.buyNowBtn}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1b4332'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2d6a4f'}
            >
              Buy Now ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Home({ user, cart, onAddToCart, onViewDetails }) {
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
                <Link 
                  to="/products" 
                  style={styles.primaryBtn}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#52b788';
                    e.target.style.color = '#1b4332';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#ffffff';
                  }}
                >
                  Explore Products 🛒
                </Link>
                <Link 
                  to="/add-product" 
                  style={styles.secondaryBtn}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#52b788';
                    e.target.style.color = '#1b4332';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#ffffff';
                  }}
                >
                  Post a Product for Sale 📦
                </Link>
              </div>
            </div>
          ) : (
            <div style={styles.ctaBox}>
              <p style={styles.authPrompt}>Join our marketplace to purchase or sell sustainable goods!</p>
              <div style={styles.btnGroup}>
                <Link 
                  to="/login" 
                  style={styles.primaryBtn}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#52b788';
                    e.target.style.color = '#1b4332';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#ffffff';
                  }}
                >
                  Login to Your Account
                </Link>
                <Link 
                  to="/register" 
                  style={styles.secondaryBtn}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#52b788';
                    e.target.style.color = '#1b4332';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#ffffff';
                  }}
                >
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ margin: 0, color: '#1b4332' }}>Trending Resell & Declutter Goods</h2>
          <Link 
            to="/products" 
            style={styles.viewAll}
            onMouseEnter={(e) => {
              e.target.style.color = '#52b788';
              e.target.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#2d6a4f';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            View All Products →
          </Link>
        </div>

        <div style={styles.grid}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((p) => {
              const catName = getCategoryName(p.category);
              const originalStock = p.stock ?? 1;
              const displayStock = Math.max(0, originalStock);
              const isSoldOut = displayStock <= 0;
              
              const currentPrice = Number(p.price || 0);
              const previousPrice = Number(p.originalPrice || p.previousPrice || 0);
              const hasDiscount = previousPrice > currentPrice;
              const discountPercent = hasDiscount
                ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
                : 0;

              return (
                <div 
                  key={p._id} 
                  style={{ ...styles.card, ...(isSoldOut ? styles.soldOutCard : {}) }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(45, 106, 79, 0.18)';
                    e.currentTarget.style.borderColor = '#52b788';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <ProductImageCarousel product={p} catName={catName} isSoldOut={isSoldOut} />
                  
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{p.title}</h3>

                    <div style={styles.priceRow}>
                      <span style={styles.price}>৳{currentPrice}</span>

                      {hasDiscount && (
                        <>
                          <span style={styles.strikethroughPrice}>
                            ৳<span style={styles.numberCutWrapper}>
                              {previousPrice}
                              <span style={styles.diagonalCutLine} />
                            </span>
                          </span>
                          <span style={styles.discountBadge}>
                            {discountPercent}% discount!
                          </span>
                        </>
                      )}

                      <span style={{ ...styles.stockText, color: isSoldOut ? '#d32f2f' : '#2e7d32', marginLeft: 'auto' }}>
                        {isSoldOut ? 'Out of Stock' : `Stock Available: ${displayStock}`}
                      </span>
                    </div>

                    <button 
                      onClick={() => onViewDetails(p)} 
                      style={styles.buyBtn}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2d6a4f'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1b4332'}
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
              <Link 
                to={user ? "/add-product" : "/login"} 
                style={styles.emptyStateBtn}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1b4332'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2d6a4f'}
              >
                {user ? "+ Sell an Item" : "+ Login to Sell Items"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductsPage({ user, cart, onAddToCart, viewProductDetails, setViewProductDetails, editingProduct, setEditingProduct, handleOpenEdit, handleSaveEdit, handleDeleteProduct, editStock, setEditStock, editPrice, setEditPrice, editOriginalPrice, setEditOriginalPrice, editModalStage, setEditModalStage, closeEditModal, handleEditModalAnimationEnd }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setProducts(filtered);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchProducts('All', '');
    const interval = setInterval(() => {
      fetchProducts(selectedCategory, searchQuery);
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedCategory, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(selectedCategory, searchQuery);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    fetchProducts(cat, searchQuery);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    await onAddToCart(product);
    fetchProducts(selectedCategory, searchQuery);
  };

  const handleBuyNow = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    await onAddToCart(product, true);
    navigate('/cart');
  };

  const currentUserId = user?._id || user?.id || user?.userId;

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
            <button 
              type="submit" 
              style={prodStyles.searchBtn}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1b4332'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2d6a4f'}
            >
              Search Products
            </button>
          </div>
        </form>

        <div style={prodStyles.pillContainer}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                style={{
                  ...prodStyles.pill,
                  backgroundColor: isSelected ? '#2d6a4f' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#2d6a4f',
                  borderColor: isSelected ? '#2d6a4f' : '#b7e4c7'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = '#e8f5e9';
                    e.target.style.borderColor = '#2d6a4f';
                  } else {
                    e.target.style.backgroundColor = '#1b4332';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#b7e4c7';
                  } else {
                    e.target.style.backgroundColor = '#2d6a4f';
                  }
                }}
              >
                {cat === 'All' ? '✨ All' : `${getCategoryIcon(cat)} ${cat}`}
              </button>
            );
          })}
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
              const sellerObj = typeof p.seller === 'object' ? p.seller : {};
              const sellerId = sellerObj._id || sellerObj.id || p.seller;
              const isOwner = Boolean(currentUserId && sellerId && String(currentUserId) === String(sellerId));
              
              const originalStock = p.stock ?? 1;
              const displayStock = Math.max(0, originalStock);
              const isSoldOut = displayStock <= 0;

              const currentPrice = Number(p.price || 0);
              const previousPrice = Number(p.originalPrice || p.previousPrice || 0);
              const hasDiscount = previousPrice > currentPrice;
              const discountPercent = hasDiscount
                ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
                : 0;

              return (
                <ProductCard
                  key={p._id}
                  product={p}
                  displayStock={displayStock}
                  isOwner={isOwner}
                  isSoldOut={isSoldOut}
                  currentPrice={currentPrice}
                  previousPrice={previousPrice}
                  hasDiscount={hasDiscount}
                  discountPercent={discountPercent}
                  catName={catName}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onOpenEdit={handleOpenEdit}
                  onDeleteProduct={handleDeleteProduct}
                  onViewDetails={setViewProductDetails}
                />
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
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2d6a4f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1b4332'}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {editingProduct && ReactDOM.createPortal(
        <div 
          className={`page-transition ${editModalStage}`}
          onAnimationEnd={handleEditModalAnimationEnd}
          style={prodStyles.modalOverlay}
          onClick={closeEditModal}
        >
          <div style={prodStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1b4332' }}>Restock & Manage Listing</h3>
            <form onSubmit={(e) => handleSaveEdit(e, setProducts)} style={prodStyles.modalForm}>
              <label style={prodStyles.modalLabel}>
                Stock Available:
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
                <button 
                  type="submit" 
                  style={prodStyles.saveBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1b4332';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d6a4f';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  style={prodStyles.cancelBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#424242';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#757575';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Cancel
                </button>
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
  const navigate = useNavigate();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-enter');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [viewProductDetails, setViewProductDetails] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [modalImgAnimClass, setModalImgAnimClass] = useState('img-fade-in');
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);

  const [modalStage, setModalStage] = useState('');
  const [fullScreenStage, setFullScreenStage] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editModalStage, setEditModalStage] = useState('');
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const currentUserId = user?._id || user?.id || user?.userId;

  const [cart, setCart] = useState(() => {
    if (!currentUserId) return [];
    const savedCart = localStorage.getItem(`cart_${currentUserId}`);
    if (!savedCart) return [];
    try {
      const parsed = JSON.parse(savedCart);
      return parsed.filter(item => (item.product || item._id || item.id) && item.product !== null);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`cart_${currentUserId}`, JSON.stringify(cart));
    }
  }, [cart, currentUserId]);

  const handleSetUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      const newUserId = newUser._id || newUser.id || newUser.userId;
      localStorage.setItem('user', JSON.stringify(newUser));
      const savedCart = localStorage.getItem(`cart_${newUserId}`);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCart(parsed.filter(item => (item.product || item._id || item.id) && item.product !== null));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      localStorage.removeItem('user');
      setCart([]);
    }
  };

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

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditStock(product.stock ?? 1);
    setEditPrice(Math.round(product.price ?? 0));
    setEditOriginalPrice(
      product.originalPrice || product.previousPrice 
        ? Math.round(product.originalPrice || product.previousPrice) 
        : ''
    );
    setEditModalStage('page-enter');
  };

  const closeEditModal = () => {
    setEditModalStage('page-exit');
  };

  const handleEditModalAnimationEnd = () => {
    if (editModalStage === 'page-exit') {
      setEditingProduct(null);
      setEditModalStage('');
    }
  };

  const handleSaveEdit = async (e, setProducts) => {
    e.preventDefault();
    try {
      const payload = {
        stock: Number(editStock),
        price: Math.round(Number(editPrice)),
        originalPrice: editOriginalPrice ? Math.round(Number(editOriginalPrice)) : null
      };

      const res = await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, payload);
      if (setProducts) {
        setProducts(prev => prev.map(p => p._id === res.data._id ? res.data : p));
      }
      closeEditModal();
    } catch (err) {
      alert('Failed to update product details.');
    }
  };

  const handleDeleteProduct = async (productId, setProducts) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      if (setProducts) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      }
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleAddToCart = async (product, skipToast = false) => {
    const activeUser = user || JSON.parse(localStorage.getItem('user') || 'null');
    const activeUserId = activeUser?._id || activeUser?.id || activeUser?.userId;

    if (!activeUserId) {
      navigate('/login');
      return;
    }

    try {
      const productId = product._id || product.id;
      const res = await axios.post('http://localhost:5000/api/cart/add', {
        userId: activeUserId,
        productId: productId,
        quantity: 1
      });

      const serverItems = (res.data.items || []).filter(item => item.product !== null);
      const formattedCart = serverItems.map(item => ({
        ...item.product,
        quantity: item.quantity,
        product: item.product
      }));

      setCart(formattedCart);

      if (!skipToast) {
        setToastType('success');
        setToastMessage(product.title);
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setToastType('error');
      setToastMessage(err.response?.data?.error || 'Could not update stock.');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const changeModalImageIndex = (newIndex, maxLen) => {
    if (newIndex === modalImageIndex) return;
    setModalImgAnimClass('img-fade-out');
    setTimeout(() => {
      setModalImageIndex(newIndex);
      setModalImgAnimClass('img-fade-in');
    }, 150);
  };

  const openGlobalDetailsModal = (product) => {
    setViewProductDetails(product);
    setModalImageIndex(0);
    setModalImgAnimClass('img-fade-in');
    setIsFullScreenImage(false);
    setModalStage('page-enter');
  };

  const closeGlobalDetailsModal = () => {
    setModalStage('page-exit');
  };

  const handleModalAnimationEnd = () => {
    if (modalStage === 'page-exit') {
      setViewProductDetails(null);
      setModalStage('');
    }
  };

  const openFullScreenView = () => {
    setIsFullScreenImage(true);
    setFullScreenStage('page-enter');
  };

  const closeFullScreenView = () => {
    setFullScreenStage('page-exit');
  };

  const handleFullScreenAnimationEnd = () => {
    if (fullScreenStage === 'page-exit') {
      setIsFullScreenImage(false);
      setFullScreenStage('');
    }
  };

  const validCartCount = cart.reduce((acc, item) => {
    const prod = item.product || item;
    if (!prod || prod === null) return acc;
    return acc + (item.quantity || 1);
  }, 0);

  return (
    <div style={styles.appContainer}>
      <Navbar user={user} setUser={handleSetUser} setCart={setCart} cartCount={validCartCount} />
      <NotificationToast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <main 
        className={`page-transition ${transitionStage}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <Routes location={displayLocation}>
          <Route path="/" element={<Home user={user} cart={cart} onAddToCart={handleAddToCart} onViewDetails={openGlobalDetailsModal} />} />
          <Route path="/products" element={
            <ProductsPage 
              user={user} 
              cart={cart} 
              onAddToCart={handleAddToCart} 
              viewProductDetails={viewProductDetails} 
              setViewProductDetails={openGlobalDetailsModal} 
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              handleOpenEdit={handleOpenEdit}
              handleSaveEdit={handleSaveEdit}
              handleDeleteProduct={handleDeleteProduct}
              editStock={editStock}
              setEditStock={setEditStock}
              editPrice={editPrice}
              setEditPrice={setEditPrice}
              editOriginalPrice={editOriginalPrice}
              setEditOriginalPrice={setEditOriginalPrice}
              editModalStage={editModalStage}
              setEditModalStage={setEditModalStage}
              closeEditModal={closeEditModal}
              handleEditModalAnimationEnd={handleEditModalAnimationEnd}
            />
          } />
          <Route path="/add-product" element={
            <ProtectedRoute user={user}>
              <AddProduct user={user} />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute user={user}>
              <Cart 
                user={user} 
                cart={cart}
                setCart={setCart} 
              />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login setUser={handleSetUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>

      {viewProductDetails && (() => {
        const modalImages = getProductImages(viewProductDetails);
        const seller = typeof viewProductDetails.seller === 'object' && viewProductDetails.seller !== null ? viewProductDetails.seller : {};
        
        const sellerName = viewProductDetails.sellerName || seller.name || seller.username || seller.fullName || 'Abdullah-Al-Sajid Md. Saad';
        const sellerPhone = viewProductDetails.sellerPhone || seller.phone || seller.phoneNumber || seller.contact || '+880 1912-915937';
        const sellerEmail = viewProductDetails.sellerEmail || seller.email || '23201020@uap-bd.edu';
        const sellerAddress = viewProductDetails.sellerAddress || seller.address || seller.location || 'Uttara, Dhaka, Bangladesh';

        const modalOriginalStock = viewProductDetails.stock ?? 1;
        const modalDisplayStock = Math.max(0, modalOriginalStock);

        const modalCurrentPrice = Number(viewProductDetails.price || 0);
        const modalPreviousPrice = Number(viewProductDetails.originalPrice || viewProductDetails.previousPrice || 0);
        const modalHasDiscount = modalPreviousPrice > modalCurrentPrice;
        const modalDiscountPercent = modalHasDiscount
          ? Math.round(((modalPreviousPrice - modalCurrentPrice) / modalPreviousPrice) * 100)
          : 0;

        return ReactDOM.createPortal(
          <>
            {isFullScreenImage && (
              <div 
                className={`page-transition ${fullScreenStage}`}
                onAnimationEnd={handleFullScreenAnimationEnd}
                style={prodStyles.fullScreenOverlay} 
                onClick={closeFullScreenView}
              >
                <button 
                  style={prodStyles.fullScreenCloseBtn} 
                  onClick={closeFullScreenView}
                  title="Back to Details Modal"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1b4332';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#1b4332';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }}
                >
                  ✕ Close Full View
                </button>

                {modalImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIdx = modalImageIndex === 0 ? modalImages.length - 1 : modalImageIndex - 1;
                      changeModalImageIndex(newIdx, modalImages.length);
                    }}
                    style={prodStyles.fullScreenArrowLeft}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(27, 67, 50, 0.85)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                      e.currentTarget.style.borderColor = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    ❮
                  </button>
                )}

                <img 
                  src={modalImages[modalImageIndex]} 
                  alt="Full Size View" 
                  className={modalImgAnimClass}
                  style={{ ...prodStyles.fullScreenImg, transition: 'opacity 0.15s ease-in-out' }} 
                  onClick={(e) => e.stopPropagation()}
                />

                {modalImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIdx = modalImageIndex === modalImages.length - 1 ? 0 : modalImageIndex + 1;
                      changeModalImageIndex(newIdx, modalImages.length);
                    }}
                    style={prodStyles.fullScreenArrowRight}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(27, 67, 50, 0.85)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                      e.currentTarget.style.borderColor = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    ❯
                  </button>
                )}
              </div>
            )}

            <div 
              className={`page-transition ${modalStage}`}
              onAnimationEnd={handleModalAnimationEnd}
              style={prodStyles.modalOverlay} 
              onClick={closeGlobalDetailsModal}
            >
              <div style={prodStyles.detailsModal} onClick={(e) => e.stopPropagation()}>
                <div style={prodStyles.detailsModalHeader}>
                  <h3 style={{ margin: 0, color: '#1b4332' }}>{viewProductDetails.title}</h3>
                  <button 
                    style={prodStyles.closeBtn} 
                    onClick={closeGlobalDetailsModal}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1b4332';
                      e.currentTarget.style.transform = 'scale(1.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={prodStyles.detailsModalBody}>
                  <div style={prodStyles.mainModalImageContainer}>
                    {modalImages.length > 0 ? (
                      <img 
                        src={modalImages[modalImageIndex]} 
                        alt={`Product Main Preview ${modalImageIndex + 1}`} 
                        className={modalImgAnimClass}
                        style={{ ...prodStyles.mainModalImg, transition: 'opacity 0.15s ease-in-out' }} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#888' }}>No Image Available</div>
                    )}

                    {modalImages.length > 0 && (
                      <button
                        type="button"
                        onClick={openFullScreenView}
                        style={prodStyles.magnifyGlassBtn}
                        title="Click to view full size image"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.transform = 'scale(1.18) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                          e.currentTarget.style.transform = 'scale(1) translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                        }}
                      >
                        🔍
                      </button>
                    )}

                    {modalImages.length > 1 && (
                      <>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newIdx = modalImageIndex === 0 ? modalImages.length - 1 : modalImageIndex - 1;
                            changeModalImageIndex(newIdx, modalImages.length);
                          }}
                          style={prodStyles.modalArrowLeft}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1b4332';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                          }}
                        >
                          ❮
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newIdx = modalImageIndex === modalImages.length - 1 ? 0 : modalImageIndex + 1;
                            changeModalImageIndex(newIdx, modalImages.length);
                          }}
                          style={prodStyles.modalArrowRight}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1b4332';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                          }}
                        >
                          ❯
                        </button>
                      </>
                    )}
                  </div>

                  {modalImages.length > 1 && (
                    <div style={prodStyles.modalGallery}>
                      {modalImages.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`Product Thumbnail ${idx + 1}`} 
                          onClick={() => changeModalImageIndex(idx, modalImages.length)}
                          style={{
                            ...prodStyles.modalThumbnail,
                            borderColor: idx === modalImageIndex ? '#2d6a4f' : '#ddd',
                            transform: idx === modalImageIndex ? 'scale(1.08)' : 'scale(1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.12)';
                            e.currentTarget.style.borderColor = '#2d6a4f';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = idx === modalImageIndex ? 'scale(1.08)' : 'scale(1)';
                            e.currentTarget.style.borderColor = idx === modalImageIndex ? '#2d6a4f' : '#ddd';
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={prodStyles.detailsInfoGrid}>
                    <div style={prodStyles.detailsInfoColumn}>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Category:</span>
                        <span style={prodStyles.detailValue}>{getCategoryIcon(viewProductDetails.category)} {getCategoryName(viewProductDetails.category)}</span>
                      </div>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Condition:</span>
                        <span style={prodStyles.detailValue}>{viewProductDetails.condition || 'N/A'}</span>
                      </div>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Stock Available:</span>
                        <span style={prodStyles.detailValue}>{modalDisplayStock} units</span>
                      </div>
                    </div>

                    <div style={prodStyles.detailsInfoColumn}>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Current Price:</span>
                        <span style={{ ...prodStyles.detailValue, color: '#2d6a4f', fontWeight: 'bold' }}>৳{modalCurrentPrice}</span>
                      </div>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Original / Previous Price:</span>
                        {modalHasDiscount ? (
                          <span style={prodStyles.modalStrikethroughPrice}>
                            ৳<span style={prodStyles.numberCutWrapper}>
                              {modalPreviousPrice}
                              <span style={prodStyles.modalDiagonalCutLine} />
                            </span>
                          </span>
                        ) : (
                          <span style={prodStyles.detailValue}>N/A</span>
                        )}
                      </div>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Discount:</span>
                        {modalHasDiscount ? (
                          <span style={{ ...prodStyles.detailValue, color: '#c05621', fontWeight: 'bold' }}>{modalDiscountPercent}% off</span>
                        ) : (
                          <span style={prodStyles.detailValue}>0%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={prodStyles.detailsDescriptionBox}>
                    <h4 style={{ margin: '0 0 6px 0', color: '#1b4332', fontSize: '0.95rem' }}>Description:</h4>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                      {viewProductDetails.description || 'No description provided by the seller.'}
                    </p>
                  </div>

                  <div style={prodStyles.detailsSellerBox}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1b4332', fontSize: '0.95rem' }}>Seller Contact Information:</h4>
                    <div style={prodStyles.sellerInfoRow}><span>👤 Name:</span> <strong>{sellerName}</strong></div>
                    <div style={prodStyles.sellerInfoRow}><span>📞 Phone:</span> <strong>{sellerPhone}</strong></div>
                    <div style={prodStyles.sellerInfoRow}><span>✉️ Email:</span> <strong>{sellerEmail}</strong></div>
                    <div style={prodStyles.sellerInfoRow}><span>📍 Location:</span> <strong>{sellerAddress}</strong></div>
                  </div>
                </div>

                <div style={prodStyles.detailsModalFooter}>
                  <button 
                    style={prodStyles.modalCloseActionBtn} 
                    onClick={closeGlobalDetailsModal}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1b4332';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(27, 67, 50, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2d6a4f';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        );
      })()}
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
    animation: 'slideIn 0.3s ease-out',
    maxWidth: '350px',
  },
  iconBox: {
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
    letterSpacing: '1px'
  },
  heroSubtitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: '30px',
    color: '#d8f3dc'
  },
  ctaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(6px)',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'inline-block',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
  },
  userBadgeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  heroAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #52b788'
  },
  userGreeting: {
    fontSize: '1.2rem',
    color: '#ffffff',
    margin: 0
  },
  authPrompt: {
    fontSize: '1.05rem',
    color: '#e9ecef',
    marginBottom: '20px'
  },
  btnGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryBtn: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: '2px solid #52b788',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: '2px solid #52b788',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  emptyStateBtn: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
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
    marginBottom: '25px',
  },
  viewAll: {
    color: '#2d6a4f',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
    border: '1px solid transparent'
  },
  soldOutCard: {
    backgroundColor: '#f0f0f0',
    opacity: 0.75,
    filter: 'grayscale(30%)'
  },
  cardBody: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: '1.15rem',
    margin: '0 0 8px 0',
    color: '#2b2b2b',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '15px',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  strikethroughPrice: {
    fontSize: '0.9rem',
    color: '#a0aec0',
    display: 'inline-block',
  },
  numberCutWrapper: {
    position: 'relative',
    display: 'inline-block',
    padding: '0 2px',
  },
  diagonalCutLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '2px',
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
    marginTop: 'auto',
    transition: 'background-color 0.2s ease',
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
    marginBottom: '15px',
    textAlign: 'center'
  },
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa'
  }
};

const prodStyles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    paddingBottom: '50px',
  },
  headerBanner: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    padding: '40px 20px',
    textAlign: 'center',
  },
  bannerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  bannerTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '10px',
  },
  bannerSubtitle: {
    fontSize: '1.15rem',
    color: '#d8f3dc',
    margin: 0,
  },
  mainContainer: {
    maxWidth: '1200px',
    margin: '25px auto 0 auto',
    padding: '0 20px',
    position: 'relative',
    zIndex: 3,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  },
  searchGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1 1 280px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '1rem',
    outline: 'none',
  },
  categorySelect: {
    flex: '0 1 180px',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '1rem',
    backgroundColor: '#fff',
    outline: 'none',
  },
  searchBtn: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s ease',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
    position: 'relative',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
  },
  soldOutCard: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
    opacity: 0.75,
    filter: 'grayscale(30%)'
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
  cardHeaderImageContainer: {
    height: '190px',
    width: '100%',
    position: 'relative',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardHeaderImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noImageFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0'
  },
  cardHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)'
  },
  categoryBadge: {
    backgroundColor: 'rgba(27, 67, 50, 0.85)',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px',
    backdropFilter: 'blur(4px)'
  },
  conditionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1b4332',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  arrowLeftBtn: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.8rem',
    zIndex: 3,
    transition: 'all 0.2s ease'
  },
  arrowRightBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.8rem',
    zIndex: 3,
    transition: 'all 0.2s ease'
  },
  dotsContainer: {
    position: 'absolute',
    bottom: '8px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    zIndex: 3
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  itemTitle: {
    fontSize: '1.1rem',
    margin: '0 0 6px 0',
    color: '#2b2b2b',
  },
  detailsBtn: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    border: 'none',
    padding: '9px',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    width: '100%',
    marginBottom: '10px',
    transition: 'background-color 0.2s ease',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  priceTag: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  strikethroughPrice: {
    fontSize: '0.85rem',
    color: '#a0aec0',
    display: 'inline-block',
  },
  numberCutWrapper: {
    position: 'relative',
    display: 'inline-block',
    padding: '0 2px',
  },
  diagonalCutLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '2px',
    backgroundColor: '#e53e3e',
    transform: 'rotate(-15deg)',
    transformOrigin: 'center'
  },
  modalStrikethroughPrice: {
    fontSize: '0.95rem',
    color: '#a0aec0',
    display: 'inline-block',
  },
  modalDiagonalCutLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '2px',
    backgroundColor: '#e53e3e',
    transform: 'rotate(-15deg)',
    transformOrigin: 'center'
  },
  discountBadge: {
    backgroundColor: '#feebc8',
    color: '#c05621',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '2px 5px',
    borderRadius: '4px'
  },
  stockBadge: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: '3px 6px',
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
    padding: '9px 4px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'background-color 0.2s ease'
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '9px 4px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'background-color 0.2s ease'
  },
  ownerBox: {
    backgroundColor: '#f1f8f5',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
    marginTop: 'auto'
  },
  ownerNotice: {
    margin: '0 0 6px 0',
    fontSize: '0.75rem',
    color: '#2d6a4f',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  ownerActionGroup: {
    display: 'flex',
    gap: '6px'
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '7px 4px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#d32f2f',
    color: '#ffffff',
    border: 'none',
    padding: '7px 4px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  singleSoldOutBtn: {
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  resetBtn: {
    backgroundColor: '#1b4332',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '15px'
  },
  fullScreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  },
  fullScreenImg: {
    maxWidth: '85vw',
    maxHeight: '85vh',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: '20px',
    right: '25px',
    backgroundColor: '#ffffff',
    color: '#1b4332',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 10001,
    transition: 'all 0.2s ease'
  },
  fullScreenArrowLeft: {
    position: 'absolute',
    left: '25px',
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    border: '2px solid rgba(255, 255, 255, 0.6)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    cursor: 'pointer',
    zIndex: 10001,
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s ease'
  },
  fullScreenArrowRight: {
    position: 'absolute',
    right: '25px',
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    border: '2px solid rgba(255, 255, 255, 0.6)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    cursor: 'pointer',
    zIndex: 10001,
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s ease'
  },
  detailsModal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '550px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  detailsModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s ease'
  },
  detailsModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  mainModalImageContainer: {
    position: 'relative',
    width: '100%',
    height: '240px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainModalImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  magnifyGlassBtn: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #ccc',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    zIndex: 3,
    transition: 'all 0.2s ease'
  },
  modalArrowLeft: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    zIndex: 2,
    transition: 'all 0.2s ease'
  },
  modalArrowRight: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    zIndex: 2,
    transition: 'all 0.2s ease'
  },
  modalGallery: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  modalThumbnail: {
    width: '55px',
    height: '55px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: '2px solid #ddd',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  detailsInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    backgroundColor: '#f1f8f5',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #c8e6c9'
  },
  detailsInfoColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#2d6a4f',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: '0.95rem',
    color: '#1f2937'
  },
  detailsDescriptionBox: {
    backgroundColor: '#f1f8f5',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #c8e6c9'
  },
  detailsSellerBox: {
    backgroundColor: '#f1f8f5',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  sellerInfoRow: {
    fontSize: '0.88rem',
    color: '#2d6a4f',
    display: 'flex',
    gap: '6px'
  },
  detailsModalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '12px',
  },
  modalCloseActionBtn: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '450px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
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
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#757575',
    color: '#ffffff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default App;