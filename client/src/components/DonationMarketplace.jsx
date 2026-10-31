import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductSearch from './ProductSearch';
import CheckoutModal from './CheckoutModal';
import OrderSuccessModal from './OrderSuccessModal';
import InvoiceModal from './InvoiceModal';

const CATEGORIES = [
  'All',
  'Medicine',
  'Food',
  'Electronics',
  'Stationery',
  'Books',
  'Clothing',
  'Miscellaneous'
];

const formatMediaSrc = (img) => {
  if (!img) return null;
  if (typeof img === 'object') {
    img = img.url || img.path || img.src || null;
  }
  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    if (
      trimmed.startsWith('http') || 
      trimmed.startsWith('data:image') || 
      trimmed.startsWith('data:video') || 
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }
    if (trimmed.length > 50) {
      const prefix = trimmed.startsWith('AAAA') || trimmed.includes('video') ? 'data:video/mp4;base64,' : 'data:image/jpeg;base64,';
      return `${prefix}${trimmed}`;
    }
    if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
      return `http://localhost:5000/${trimmed.replace(/^\//, '')}`;
    }
    return trimmed;
  }
  return null;
};

const isVideoUrl = (url) => {
  if (!url) return false;
  return url.startsWith('data:video') || url.includes('video/') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
};

const getProductImages = (product) => {
  if (!product) return [];
  let list = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    list = product.images.map(formatMediaSrc).filter(Boolean);
  } else if (Array.isArray(product.photos) && product.photos.length > 0) {
    list = product.photos.map(formatMediaSrc).filter(Boolean);
  }
  if (list.length === 0) {
    const single = formatMediaSrc(product.image || product.imageUrl || product.photo);
    if (single) list.push(single);
  }
  return list.length > 0 ? list : [];
};

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
  const mediaList = getProductImages(product);
  const [activeIdx, setActiveIdx] = useState(0);
  const [animClass, setAnimClass] = useState('img-fade-in');
  const [isMuted, setIsMuted] = useState(true);

  const changeMedia = (newIndex) => {
    if (newIndex === activeIdx) return;
    setAnimClass('img-fade-out');
    setTimeout(() => {
      setActiveIdx(newIndex);
      setAnimClass('img-fade-in');
    }, 150);
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    const newIdx = activeIdx === 0 ? mediaList.length - 1 : activeIdx - 1;
    changeMedia(newIdx);
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    const newIdx = activeIdx === mediaList.length - 1 ? 0 : activeIdx + 1;
    changeMedia(newIdx);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(prev => !prev);
  };

  const hasMedia = mediaList.length > 0;
  const currentSrc = hasMedia ? mediaList[activeIdx] : null;
  const isCurrentVideo = isVideoUrl(currentSrc);

  return (
    <div style={prodStyles.cardHeaderImageContainer}>
      {hasMedia && currentSrc ? (
        isCurrentVideo ? (
          <video
            src={currentSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className={animClass}
            style={{ ...prodStyles.cardHeaderImg, transition: 'opacity 0.15s ease-in-out' }}
          />
        ) : (
          <img 
            src={currentSrc} 
            alt={product.title || 'Donation Media'} 
            className={animClass}
            style={{ ...prodStyles.cardHeaderImg, transition: 'opacity 0.15s ease-in-out' }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        )
      ) : (
        <div style={prodStyles.noImageFallback}>
          <span style={{ fontSize: '2.5rem', marginBottom: '4px' }}>🎁</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#6b7280' }}>No Media Available</span>
        </div>
      )}

      <div style={prodStyles.cardHeaderOverlay}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <span style={prodStyles.categoryBadge}>
            {getCategoryIcon(product.category)} Donation
          </span>
          {product.condition && (
            <span style={prodStyles.conditionBadge}>
              {product.condition}
            </span>
          )}
        </div>
        {isSoldOut && <span style={prodStyles.soldOutBadge}>Claimed</span>}
      </div>

      {isCurrentVideo && (
        <button
          type="button"
          onClick={toggleMute}
          style={prodStyles.cardMuteBtn}
          title={isMuted ? "Unmute Video" : "Mute Video"}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.85)';
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {mediaList.length > 1 && (
        <>
          <button 
            type="button" 
            onClick={prevMedia} 
            style={prodStyles.arrowLeftBtn} 
            title="Previous media"
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
            onClick={nextMedia} 
            style={prodStyles.arrowRightBtn} 
            title="Next media"
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
            {mediaList.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  changeMedia(idx);
                }}
                style={{
                  ...prodStyles.dot,
                  backgroundColor: idx === activeIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  transform: idx === activeIdx ? 'scale(1.25)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (idx !== activeIdx) {
                    e.currentTarget.style.transform = 'scale(1.3)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== activeIdx) {
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

const DonationsPage = ({ user }) => {
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

  // View Details Modal States
  const [viewProductDetails, setViewProductDetails] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [modalImgAnimClass, setModalImgAnimClass] = useState('img-fade-in');
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);
  const [modalVideoMuted, setModalVideoMuted] = useState(true);
  const [modalStage, setModalStage] = useState('');
  const [fullScreenStage, setFullScreenStage] = useState('');

  // Delete states
  const [deletingDonation, setDeletingDonation] = useState(null);
  const [deleteModalStage, setDeleteModalStage] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products/donations');
      if (Array.isArray(res.data)) {
        setDonations(res.data);
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
    setCheckoutItem({
      product: item,
      quantity: 1,
      isDonationOrder: true
    });
    setIsCheckoutOpen(true);
  };

  const handleOpenDelete = (item) => {
    setDeletingDonation(item);
    setDeleteModalStage('page-enter');
  };

  const closeDeleteModal = () => {
    setDeleteModalStage('page-exit');
  };

  const confirmDeleteDonation = async () => {
    if (!deletingDonation) return;
    const donationId = deletingDonation._id;
    const donationTitle = deletingDonation.title || 'Donation Item';

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = storedUser.token || user?.token;

    try {
      await axios.delete(`http://localhost:5000/api/products/${donationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setDonations(prev => prev.filter(item => item._id !== donationId));
      setDeletingDonation(prev => ({ ...prev, successText: `"${donationTitle}" has been deleted successfully.` }));
    } catch (err) {
      console.error('Delete error details:', err.response?.data || err.message);
      alert('Failed to delete donation: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
      closeDeleteModal();
      return;
    }

    setDeleteModalStage('page-exit');
  };

  const handleDeleteModalAnimationEnd = () => {
    if (deleteModalStage === 'page-exit') {
      if (deletingDonation?.successText && !deleteSuccessMessage) {
        setDeleteSuccessMessage(deletingDonation.successText);
        setDeleteModalStage('page-enter');

        setTimeout(() => {
          setDeleteModalStage('page-exit');
        }, 2000);
      } else {
        setDeletingDonation(null);
        setDeleteSuccessMessage(null);
        setDeleteModalStage('');
      }
    }
  };

  const openGlobalDetailsModal = (item) => {
    setViewProductDetails(item);
    setModalImageIndex(0);
    setModalImgAnimClass('img-fade-in');
    setIsFullScreenImage(false);
    setModalVideoMuted(true);
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

  const changeModalImageIndex = (newIndex) => {
    if (newIndex === modalImageIndex) return;
    setModalImgAnimClass('img-fade-out');
    setTimeout(() => {
      setModalImageIndex(newIndex);
      setModalImgAnimClass('img-fade-in');
    }, 150);
  };

  const currentUserId = user?._id || user?.id || user?.userId;

  const filteredDonations = donations.filter((item) => {
    const itemCat = getCategoryName(item.category).toLowerCase();
    const matchesCat = selectedCategory === 'All' || itemCat === selectedCategory.toLowerCase() || itemCat.includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery.trim() || (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    const itemLocation = (item.location || item.sellerAddress || '').toLowerCase();
    const matchesLocation = !locationQuery.trim() || itemLocation.includes(locationQuery.trim().toLowerCase());
    return matchesCat && matchesSearch && matchesLocation;
  });

  return (
    <div style={prodStyles.pageWrapper}>
      <section style={prodStyles.headerBanner}>
        <div style={prodStyles.bannerContent}>
          <h2 style={prodStyles.bannerTitle}>Eco-Cart Donation Hub 🎁</h2>
          <p style={{
            fontSize: '1.08rem',
            fontStyle: 'italic',
            fontWeight: 'bold',
            color: '#e8f5e9',
            margin: 0,
            letterSpacing: '0.2px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            textAlign: 'center'
          }}>
            Claim free donation items or donate surplus goods effortlessly
          </p>
        </div>
      </section>

      <div style={prodStyles.mainContainer}>
        <ProductSearch
          selectedCategory={selectedCategory}
          searchTerm={searchQuery}
          locationTerm={locationQuery}
          hidePriceFilter={true}
          onCategoryChange={setSelectedCategory}
          onSearch={({ searchTerm, location, category }) => {
            if (searchTerm !== undefined) setSearchQuery(searchTerm);
            if (location !== undefined) setLocationQuery(location);
            if (category !== undefined) setSelectedCategory(category);
          }}
          onSearchTermChange={setSearchQuery}
          onLocationChange={setLocationQuery}
        />

        <div style={prodStyles.pillContainer}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
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
            {selectedCategory === 'All' ? 'All Available Donations' : `${selectedCategory} Donations`}
          </h3>
          <span style={prodStyles.countBadge}>{filteredDonations.length} Items Available</span>
        </div>

        <div style={prodStyles.grid}>
          {filteredDonations.length > 0 ? (
            filteredDonations.map((item) => {
              const catName = getCategoryName(item.category);
              const sellerObj = item.seller && typeof item.seller === 'object' ? item.seller : {};
              const sellerId = sellerObj._id || sellerObj.id || item.seller;
              const isOwner = Boolean(currentUserId && sellerId && String(currentUserId) === String(sellerId));

              const originalStock = item.stock ?? 1;
              const displayStock = Math.max(0, originalStock);
              const isSoldOut = displayStock <= 0;

              return (
                <div 
                  key={item._id} 
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
                  <ProductImageCarousel product={item} catName={catName} isSoldOut={isSoldOut} />

                  <div style={prodStyles.cardBody}>
                    <h4 style={prodStyles.itemTitle}>{item.title}</h4>

                    <div style={prodStyles.itemMeta}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#2d6a4f' }}>
                        ৳0 <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555' }}>(+ Standard Shipping Fee)</span>
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#d32f2f', fontWeight: '700', width: '100%', display: 'block', marginTop: '-2px', marginBottom: '4px' }}>
                        Flat Delivery All Over BD!
                      </span>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => openGlobalDetailsModal(item)} 
                      style={prodStyles.detailsBtn}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2d6a4f'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1b4332'}
                    >
                      View Details
                    </button>

                    <div style={prodStyles.cardActionWrapper}>
                      {isOwner ? (
                        <div style={prodStyles.ownerBox}>
                          <p style={prodStyles.ownerNotice}>You are donating this product</p>
                          <button 
                            onClick={() => handleOpenDelete(item)} 
                            style={prodStyles.deleteBtn}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#b71c1c'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#d32f2f'}
                          >
                            Delete
                          </button>
                        </div>
                      ) : isSoldOut ? (
                        <button disabled style={prodStyles.singleSoldOutBtn}>
                          Claimed
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleClaimNow(item)}
                          style={prodStyles.buyNowBtn}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1b4332';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(27, 67, 50, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#2d6a4f';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          Claim Now ⚡
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={prodStyles.emptyBox}>
              <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '18px', fontWeight: '600' }}>
                No item found matching your search
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setLocationQuery(''); setSelectedCategory('All'); }}
                style={{
                  ...prodStyles.resetBtn,
                  background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
                  padding: '13px 30px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(27, 67, 50, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '0.4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(45, 106, 79, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(27, 67, 50, 0.2)';
                }}
              >
                🗑️ Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewProductDetails && (() => {
        const modalMediaList = getProductImages(viewProductDetails);
        const sellerObj = viewProductDetails.seller;
        const seller = typeof sellerObj === 'object' && sellerObj !== null ? sellerObj : {};

        const sellerName = viewProductDetails.sellerName || seller.name || seller.username || seller.fullName || sellerObj?.name || 'Donor Name Unavailable';
        const sellerPhone = viewProductDetails.sellerPhone || seller.phone || seller.phoneNumber || seller.contact || sellerObj?.phone || 'Not Provided';
        const sellerEmail = viewProductDetails.sellerEmail || seller.email || sellerObj?.email || 'Not Provided';
        const sellerAddress = viewProductDetails.location || viewProductDetails.sellerAddress || seller.location || seller.address || sellerObj?.location || sellerObj?.address || 'Bangladesh';

        const currentModalSrc = modalMediaList[modalImageIndex] || '';
        const isCurrentModalVideo = isVideoUrl(currentModalSrc);

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

                {modalMediaList.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIdx = modalImageIndex === 0 ? modalMediaList.length - 1 : modalImageIndex - 1;
                      changeModalImageIndex(newIdx);
                    }}
                    style={prodStyles.fullScreenArrowLeft}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(27, 67, 50, 0.75)';
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

                {isCurrentModalVideo ? (
                  <video 
                    src={currentModalSrc} 
                    autoPlay 
                    controls 
                    muted={modalVideoMuted}
                    className={modalImgAnimClass}
                    style={{ ...prodStyles.fullScreenImg, transition: 'opacity 0.15s ease-in-out' }} 
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <img 
                    src={currentModalSrc} 
                    alt="Full Size View" 
                    className={modalImgAnimClass}
                    style={{ ...prodStyles.fullScreenImg, transition: 'opacity 0.15s ease-in-out' }} 
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {modalMediaList.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIdx = modalImageIndex === modalMediaList.length - 1 ? 0 : modalImageIndex + 1;
                      changeModalImageIndex(newIdx);
                    }}
                    style={prodStyles.fullScreenArrowRight}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(27, 67, 50, 0.75)';
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
                    {modalMediaList.length > 0 ? (
                      isCurrentModalVideo ? (
                        <video 
                          src={currentModalSrc} 
                          autoPlay 
                          loop 
                          muted={modalVideoMuted}
                          playsInline
                          className={modalImgAnimClass}
                          style={{ ...prodStyles.mainModalImg, transition: 'opacity 0.15s ease-in-out' }} 
                        />
                      ) : (
                        <img 
                          src={currentModalSrc} 
                          alt={`Donation Preview ${modalImageIndex + 1}`} 
                          className={modalImgAnimClass}
                          style={{ ...prodStyles.mainModalImg, transition: 'opacity 0.15s ease-in-out' }} 
                        />
                      )
                    ) : (
                      <div style={{ textAlign: 'center', color: '#888' }}>No Media Available</div>
                    )}

                    {isCurrentModalVideo && (
                      <button
                        type="button"
                        onClick={() => setModalVideoMuted(prev => !prev)}
                        style={prodStyles.modalMuteBtn}
                        title={modalVideoMuted ? "Unmute Video" : "Mute Video"}
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
                        {modalVideoMuted ? '🔇' : '🔊'}
                      </button>
                    )}

                    {modalMediaList.length > 0 && (
                      <button
                        type="button"
                        onClick={openFullScreenView}
                        style={prodStyles.magnifyGlassBtn}
                        title="Click to view full size media"
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

                    {modalMediaList.length > 1 && (
                      <>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newIdx = modalImageIndex === 0 ? modalMediaList.length - 1 : modalImageIndex - 1;
                            changeModalImageIndex(newIdx);
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
                            const newIdx = modalImageIndex === modalMediaList.length - 1 ? 0 : modalImageIndex + 1;
                            changeModalImageIndex(newIdx);
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

                  {modalMediaList.length > 1 && (
                    <div style={prodStyles.modalGallery}>
                      {modalMediaList.map((mediaSrc, idx) => {
                        const isThumbVideo = isVideoUrl(mediaSrc);
                        return (
                          <div
                            key={idx}
                            onClick={() => changeModalImageIndex(idx)}
                            style={{
                              ...prodStyles.modalThumbnailWrapper,
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
                          >
                            {isThumbVideo ? (
                              <video src={mediaSrc} style={prodStyles.modalThumbnailMedia} muted />
                            ) : (
                              <img src={mediaSrc} alt={`Thumbnail ${idx + 1}`} style={prodStyles.modalThumbnailMedia} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #a5d6a7',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#1b4332',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    lineHeight: '1.6'
                  }}>
                    💡 <strong>Donation Notice</strong> 💡<br />
                    <span>The item price is automatically set to ৳0.</span><br />
                    <span>Anyone who claims this item will only pay the standard shipping fee.</span>
                  </div>

                  <div style={prodStyles.detailsInfoGrid}>
                    <div style={prodStyles.detailsInfoColumn}>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Category:</span>
                        <span style={prodStyles.detailValue}>{getCategoryIcon(viewProductDetails.category)} {getCategoryName(viewProductDetails.category)} Donation</span>
                      </div>
                    </div>

                    <div style={prodStyles.detailsInfoColumn}>
                      <div style={prodStyles.detailItem}>
                        <span style={prodStyles.detailLabel}>Condition:</span>
                        <span style={prodStyles.detailValue}>{viewProductDetails.condition || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={prodStyles.detailsDescriptionBox}>
                    <h4 style={{ margin: '0 0 6px 0', color: '#1b4332', fontSize: '0.95rem' }}>Description:</h4>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                      {viewProductDetails.description || 'No description provided by the donor.'}
                    </p>
                  </div>

                  <div style={prodStyles.detailsSellerBox}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1b4332', fontSize: '0.95rem' }}>Donor Contact Information:</h4>
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

      {deletingDonation && ReactDOM.createPortal(
        <div
          className={`page-transition ${deleteModalStage}`}
          onAnimationEnd={handleDeleteModalAnimationEnd}
          style={prodStyles.modalOverlay}
          onClick={deleteSuccessMessage ? undefined : closeDeleteModal}
        >
          {deleteSuccessMessage ? (
            <div className="success-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
              <div className="success-card" style={{
                backgroundColor: '#ffffff',
                padding: '30px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '380px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#e8f5e9',
                  border: '2px solid #52b788',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  color: '#2d6a4f',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(82, 183, 136, 0.25)'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1b4332', margin: '0 0 6px 0' }}>Deleted Successfully! 🗑️</h3>
                <p style={{ fontSize: '0.92rem', color: '#4b5563', fontWeight: '600', margin: 0 }}>
                  {deleteSuccessMessage}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ ...prodStyles.modal, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={closeDeleteModal}
                title="Close"
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  color: '#6b7280',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.transform = 'scale(1.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>

              <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Confirm Deletion 🗑️</h3>
              <p style={{ margin: '0 0 20px 0', color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5', paddingRight: '20px' }}>
                Are you sure you want to delete <strong>"{deletingDonation.title}"</strong>? This action cannot be undone.
              </p>
              <div style={prodStyles.modalButtons}>
                <button
                  type="button"
                  onClick={confirmDeleteDonation}
                  style={{
                    flex: 1,
                    backgroundColor: '#d32f2f',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b71c1c';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(211, 47, 47, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d32f2f';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  style={{
                    flex: 1,
                    backgroundColor: '#2d6a4f',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1b4332';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 106, 79, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d6a4f';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

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

      {showInvoice && completedOrder && (
        <InvoiceModal
          order={completedOrder}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
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
  mainContainer: {
    maxWidth: '1200px',
    margin: '25px auto 0 auto',
    padding: '0 20px',
    position: 'relative',
    zIndex: 3,
  },
  pillContainer: {
    display: 'flex',
    justifyContent: 'center',
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
    alignItems: 'stretch',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
    zIndex: 2,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
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
  cardMuteBtn: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
    zIndex: '3',
    transition: 'all 0.2s ease',
  },
  modalMuteBtn: {
    position: 'absolute',
    bottom: '10px',
    right: '54px',
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
    zIndex: '3',
    transition: 'all 0.2s ease'
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
    zIndex: '3',
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
    zIndex: '3',
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
    zIndex: '3'
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
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  itemTitle: {
    fontSize: '1.1rem',
    margin: '0 0 8px 0',
    color: '#2b2b2b',
    minHeight: '2.6em',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '10px',
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
    marginBottom: '8px',
    transition: 'background-color 0.2s ease',
  },
  cardActionWrapper: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  buyNowBtn: {
    width: '100%',
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '9px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease'
  },
  ownerBox: {
    backgroundColor: '#f1f8f5',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    boxSizing: 'border-box'
  },
  ownerNotice: {
    margin: 0,
    fontSize: '0.7rem',
    color: '#2d6a4f',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  deleteBtn: {
    width: '100%',
    backgroundColor: '#d32f2f',
    color: '#ffffff',
    border: 'none',
    padding: '7px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
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
  modalThumbnailWrapper: {
    width: '55px',
    height: '55px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '2px solid #ddd',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#000'
  },
  modalThumbnailMedia: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
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
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '10px'
  }
};

export default DonationsPage;