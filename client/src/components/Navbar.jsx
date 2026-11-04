import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AccountInfoModal from './AccountInfoModal';
import InvoiceModal from './InvoiceModal';
import OfferPopup from './OfferPopup';
import EcoCartWhyModal from './EcoCartWhyModal';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const Navbar = ({ user, setUser, setCart, cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMounted, setNotifMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [authDropdownMounted, setAuthDropdownMounted] = useState(false);

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const [avatarAlertOpen, setAvatarAlertOpen] = useState(false);
  const [avatarAlertMounted, setAvatarAlertMounted] = useState(false);

  const [sellerAlertOpen, setSellerAlertOpen] = useState(false);
  const [sellerAlertMounted, setSellerAlertMounted] = useState(false);

  const [cartAlertOpen, setCartAlertOpen] = useState(false);
  const [cartAlertMounted, setCartAlertMounted] = useState(false);

  const [trackAlertOpen, setTrackAlertOpen] = useState(false);
  const [trackAlertMounted, setTrackAlertMounted] = useState(false);

  const [sellAlertOpen, setSellAlertOpen] = useState(false);
  const [sellAlertMounted, setSellAlertMounted] = useState(false);

  const [donateAlertOpen, setDonateAlertOpen] = useState(false);
  const [donateAlertMounted, setDonateAlertMounted] = useState(false);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, closing: false, message: '' });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const dropdownRef = useRef(null);
  const authDropdownRef = useRef(null);
  const notifRef = useRef(null);
  const sellerAlertRef = useRef(null);
  const cartAlertRef = useRef(null);
  const trackAlertRef = useRef(null);
  const sellAlertRef = useRef(null);
  const donateAlertRef = useRef(null);
  const fileInputRef = useRef(null);

  const closeTimerRef = useRef(null);
  const authCloseTimerRef = useRef(null);
  const notifCloseTimerRef = useRef(null);
  const autoHideTimerRef = useRef(null);
  const avatarAlertTimerRef = useRef(null);
  const sellerAlertTimerRef = useRef(null);
  const cartAlertTimerRef = useRef(null);
  const trackAlertTimerRef = useRef(null);
  const sellAlertTimerRef = useRef(null);
  const donateAlertTimerRef = useRef(null);
  const successModalTimerRef = useRef(null);

  const userId = user?._id || user?.id;
  const isDeliveryTeam = user?.email === 'sajid019129@gmail.com' || user?.role === 'delivery-team';
  const isNgoRep = Boolean(user?.isNgoRep || user?.role === 'ngo' || (user?.dob && String(user.dob).includes('NGO')));

  const showVerifyPhones = !user || (!isNgoRep && !isDeliveryTeam);

  const handleLogoHomeClick = (e, path) => {
    e.preventDefault();
    setShowOfferModal(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDropdownOpen(false);
    setDropdownMounted(false);
    navigate(path);
  };

  const getNotificationLogo = (notif) => {
    const text = (notif.title + ' ' + notif.message).toLowerCase();
    if (text.includes('bkash')) return '/bKash.jpg';
    if (text.includes('nagad')) return '/Nagad.jpg';
    if (text.includes('upay')) return '/Upay.jpg';
    if (text.includes('mastercard') || text.includes('card')) return '/MasterCard.png';
    if (text.includes('cod') || text.includes('cash on delivery') || text.includes('delivery man')) return '/Cash on Delivery.jpg';
    if (text.includes('bank') || text.includes('settlement')) return '/Bank.png';
    return '/Eco-Cart Profile Picture.jpg';
  };

  const fetchNotifications = () => {
    if (userId && !isDeliveryTeam) {
      axios.get(`http://localhost:5000/api/notifications/${userId}`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setNotifications(res.data);
            const unread = res.data.filter(n => !n.isRead).length;
            setUnreadCount(unread);
          }
        })
        .catch(err => console.error('Failed to fetch notifications:', err));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const handleOrderPlaced = () => {
      fetchNotifications();
    };
    window.addEventListener('orderPlaced', handleOrderPlaced);
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
    };
  }, [userId, isDeliveryTeam]);

  const closeAllDropdowns = () => {
    if (dropdownOpen) closeDropdown();
    if (authDropdownOpen) closeAuthDropdown();
    if (notifOpen) closeNotif();
    if (avatarAlertOpen) closeAvatarAlert();
    if (sellerAlertOpen) closeSellerAlert();
    if (cartAlertOpen) closeCartAlert();
    if (trackAlertOpen) closeTrackAlert();
    if (sellAlertOpen) closeSellAlert();
    if (donateAlertOpen) closeDonateAlert();
  };

  const openDropdown = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDropdownMounted(true);
    setDropdownOpen(true);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setDropdownMounted(false);
      closeTimerRef.current = null;
    }, 180);
  };

  const toggleDropdown = () => {
    if (dropdownOpen) closeDropdown();
    else {
      closeAllDropdowns();
      openDropdown();
    }
  };

  const openAuthDropdown = () => {
    if (authCloseTimerRef.current) clearTimeout(authCloseTimerRef.current);
    setAuthDropdownMounted(true);
    setAuthDropdownOpen(true);
  };

  const closeAuthDropdown = () => {
    setAuthDropdownOpen(false);
    if (authCloseTimerRef.current) clearTimeout(authCloseTimerRef.current);
    authCloseTimerRef.current = setTimeout(() => {
      setAuthDropdownMounted(false);
      authCloseTimerRef.current = null;
    }, 180);
  };

  const toggleAuthDropdown = () => {
    if (authDropdownOpen) closeAuthDropdown();
    else {
      closeAllDropdowns();
      openAuthDropdown();
    }
  };

  const openNotif = async () => {
    if (notifCloseTimerRef.current) clearTimeout(notifCloseTimerRef.current);
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    closeAllDropdowns();

    setNotifMounted(true);
    setNotifOpen(true);

    if (userId && unreadCount > 0) {
      try {
        await axios.put(`http://localhost:5000/api/notifications/read/${userId}`);
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }

    if (!user) {
      autoHideTimerRef.current = setTimeout(() => {
        closeNotif();
      }, 3500);
    }
  };

  const closeNotif = () => {
    setNotifOpen(false);
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    if (notifCloseTimerRef.current) clearTimeout(notifCloseTimerRef.current);
    notifCloseTimerRef.current = setTimeout(() => {
      setNotifMounted(false);
      notifCloseTimerRef.current = null;
    }, 180);
  };

  const toggleNotif = () => {
    if (notifOpen) closeNotif();
    else {
      closeAllDropdowns();
      openNotif();
    }
  };

  const handleFetchOrderInvoice = async (notif, e) => {
    if (e) e.stopPropagation();
    let queryVal = notif.orderNumber || notif.orderId;

    if (!queryVal) {
      const fullText = (notif.title || '') + ' ' + (notif.message || '');
      const match = fullText.match(/(?:ECO|DON)-\d+-\d+/i);
      if (match) {
        queryVal = match[0];
      }
    }

    if (queryVal) {
      try {
        const endpoint = queryVal.startsWith('ECO-') || queryVal.startsWith('DON-')
          ? `http://localhost:5000/api/orders/track/${encodeURIComponent(queryVal)}`
          : `http://localhost:5000/api/orders/id/${encodeURIComponent(queryVal)}`;

        const res = await axios.get(endpoint);
        if (res.data) {
          closeNotif();
          const orderData = Array.isArray(res.data) ? res.data[0] : res.data;
          setSelectedInvoiceOrder(orderData);
          return;
        }
      } catch (err) {
        console.error('API order lookup failed for notification click:', err);
      }
    }

    closeNotif();
    navigate('/track-order');
  };

  const renderMessageWithHyperlink = (notif) => {
    const msg = notif.message || '';
    const targetPhrase = "Click here to view or download your official invoice.";
    
    if (msg.includes(targetPhrase)) {
      const parts = msg.split(targetPhrase);
      return (
        <span>
          {parts[0]}
          <span 
            className="notif-invoice-link" 
            onClick={(e) => handleFetchOrderInvoice(notif, e)}
          >
            {targetPhrase}
          </span>
          {parts[1]}
        </span>
      );
    }
    return msg;
  };

  const triggerAvatarAlert = () => {
    closeAllDropdowns();
    if (avatarAlertTimerRef.current) clearTimeout(avatarAlertTimerRef.current);
    setAvatarAlertMounted(true);
    setAvatarAlertOpen(true);
    avatarAlertTimerRef.current = setTimeout(() => {
      closeAvatarAlert();
    }, 3500);
  };

  const closeAvatarAlert = () => {
    setAvatarAlertOpen(false);
    if (avatarAlertTimerRef.current) clearTimeout(avatarAlertTimerRef.current);
    avatarAlertTimerRef.current = setTimeout(() => {
      setAvatarAlertMounted(false);
      avatarAlertTimerRef.current = null;
    }, 180);
  };

  const triggerSellerAlert = () => {
    closeAllDropdowns();
    if (sellerAlertTimerRef.current) clearTimeout(sellerAlertTimerRef.current);
    setSellerAlertMounted(true);
    setSellerAlertOpen(true);
    sellerAlertTimerRef.current = setTimeout(() => {
      closeSellerAlert();
    }, 3500);
  };

  const closeSellerAlert = () => {
    setSellerAlertOpen(false);
    if (sellerAlertTimerRef.current) clearTimeout(sellerAlertTimerRef.current);
    sellerAlertTimerRef.current = setTimeout(() => {
      setSellerAlertMounted(false);
      sellerAlertTimerRef.current = null;
    }, 180);
  };

  const triggerCartAlert = () => {
    closeAllDropdowns();
    if (cartAlertTimerRef.current) clearTimeout(cartAlertTimerRef.current);
    setCartAlertMounted(true);
    setCartAlertOpen(true);
    cartAlertTimerRef.current = setTimeout(() => {
      closeCartAlert();
    }, 3500);
  };

  const closeCartAlert = () => {
    setCartAlertOpen(false);
    if (cartAlertTimerRef.current) clearTimeout(cartAlertTimerRef.current);
    cartAlertTimerRef.current = setTimeout(() => {
      setCartAlertMounted(false);
      cartAlertTimerRef.current = null;
    }, 180);
  };

  const triggerTrackAlert = () => {
    closeAllDropdowns();
    if (trackAlertTimerRef.current) clearTimeout(trackAlertTimerRef.current);
    setTrackAlertMounted(true);
    setTrackAlertOpen(true);
    trackAlertTimerRef.current = setTimeout(() => {
      closeTrackAlert();
    }, 3500);
  };

  const closeTrackAlert = () => {
    setTrackAlertOpen(false);
    if (trackAlertTimerRef.current) clearTimeout(trackAlertTimerRef.current);
    trackAlertTimerRef.current = setTimeout(() => {
      setTrackAlertMounted(false);
      trackAlertTimerRef.current = null;
    }, 180);
  };

  const triggerSellAlert = () => {
    closeAllDropdowns();
    if (sellAlertTimerRef.current) clearTimeout(sellAlertTimerRef.current);
    setSellAlertMounted(true);
    setSellAlertOpen(true);
    sellAlertTimerRef.current = setTimeout(() => {
      closeSellAlert();
    }, 3500);
  };

  const closeSellAlert = () => {
    setSellAlertOpen(false);
    if (sellAlertTimerRef.current) clearTimeout(sellAlertTimerRef.current);
    sellAlertTimerRef.current = setTimeout(() => {
      setSellAlertMounted(false);
      sellAlertTimerRef.current = null;
    }, 180);
  };

  const triggerDonateAlert = () => {
    closeAllDropdowns();
    if (donateAlertTimerRef.current) clearTimeout(donateAlertTimerRef.current);
    setDonateAlertMounted(true);
    setDonateAlertOpen(true);
    donateAlertTimerRef.current = setTimeout(() => {
      closeDonateAlert();
    }, 3500);
  };

  const closeDonateAlert = () => {
    setDonateAlertOpen(false);
    if (donateAlertTimerRef.current) clearTimeout(donateAlertTimerRef.current);
    donateAlertTimerRef.current = setTimeout(() => {
      setDonateAlertMounted(false);
      donateAlertTimerRef.current = null;
    }, 180);
  };

  const showSuccessPopup = (msg, callback) => {
    if (successModalTimerRef.current) clearTimeout(successModalTimerRef.current);
    setSuccessModal({ show: true, closing: false, message: msg });
    successModalTimerRef.current = setTimeout(() => {
      setSuccessModal(prev => ({ ...prev, closing: true }));
      setTimeout(() => {
        setSuccessModal({ show: false, closing: false, message: '' });
        if (callback) callback();
      }, 300);
    }, 3000);
  };

  const handleLogout = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDropdownOpen(false);
    setDropdownMounted(false);
    localStorage.removeItem('user');
    setUser(null);
    if (setCart) setCart([]);
    navigate('/');
  };

  const handleExecuteDeleteAccount = async () => {
    setConfirmDeleteModal(false);
    if (!user?.email) return;

    try {
      await axios.delete('http://localhost:5000/api/auth/delete-account', {
        data: { email: user.email }
      });

      showSuccessPopup('Your account has been deleted successfully.', () => {
        localStorage.removeItem('user');
        setUser(null);
        if (setCart) setCart([]);
        navigate('/login');
      });
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const handleNavClick = (path) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDropdownOpen(false);
    setDropdownMounted(false);
    navigate(path);
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      if (cartAlertOpen) closeCartAlert();
      else triggerCartAlert();
    }
  };

  const handleTrackClick = (e) => {
    if (!user) {
      e.preventDefault();
      if (trackAlertOpen) closeTrackAlert();
      else triggerTrackAlert();
    }
  };

  const handleSellClick = (e) => {
    if (!user) {
      e.preventDefault();
      if (sellAlertOpen) closeSellAlert();
      else triggerSellAlert();
      return;
    }
    if (!user.isSeller) {
      e.preventDefault();
      if (sellAlertOpen) closeSellAlert();
      else triggerSellAlert();
    }
  };

  const handleDonateClick = (e) => {
    if (!user) {
      e.preventDefault();
      if (donateAlertOpen) closeDonateAlert();
      else triggerDonateAlert();
      return;
    }
    navigate('/donate-item');
  };

  const handleChangePictureClick = () => {
    closeDropdown();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        try {
          const res = await axios.put('http://localhost:5000/api/auth/update-avatar', {
            email: user.email,
            avatar: compressedBase64
          });
          
          const updatedUserObj = res.data.user;
          setUser(updatedUserObj);
          localStorage.setItem('user', JSON.stringify(updatedUserObj));
          showSuccessPopup('Profile picture updated successfully!');
        } catch (err) {
          console.error('Failed to update picture:', err);
          alert(err.response?.data?.message || 'Server error while updating profile picture.');
        }
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (dropdownOpen) closeDropdown();
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target)) {
        if (authDropdownOpen) closeAuthDropdown();
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        if (notifOpen) closeNotif();
      }
      if (sellerAlertRef.current && !sellerAlertRef.current.contains(event.target)) {
        if (sellerAlertOpen) closeSellerAlert();
      }
      if (cartAlertRef.current && !cartAlertRef.current.contains(event.target)) {
        if (cartAlertOpen) closeCartAlert();
      }
      if (trackAlertRef.current && !trackAlertRef.current.contains(event.target)) {
        if (trackAlertOpen) closeTrackAlert();
      }
      if (sellAlertRef.current && !sellAlertRef.current.contains(event.target)) {
        if (sellAlertOpen) closeSellAlert();
      }
      if (donateAlertRef.current && !donateAlertRef.current.contains(event.target)) {
        if (donateAlertOpen) closeDonateAlert();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAllDropdowns();
        if (showAccountModal) setShowAccountModal(false);
        if (confirmDeleteModal) setConfirmDeleteModal(false);
        if (selectedInvoiceOrder) setSelectedInvoiceOrder(null);
        if (showWhyModal) setShowWhyModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (authCloseTimerRef.current) clearTimeout(authCloseTimerRef.current);
      if (notifCloseTimerRef.current) clearTimeout(notifCloseTimerRef.current);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      if (avatarAlertTimerRef.current) clearTimeout(avatarAlertTimerRef.current);
      if (sellerAlertTimerRef.current) clearTimeout(sellerAlertTimerRef.current);
      if (cartAlertTimerRef.current) clearTimeout(cartAlertTimerRef.current);
      if (trackAlertTimerRef.current) clearTimeout(trackAlertTimerRef.current);
      if (sellAlertTimerRef.current) clearTimeout(sellAlertTimerRef.current);
      if (donateAlertTimerRef.current) clearTimeout(donateAlertTimerRef.current);
      if (successModalTimerRef.current) clearTimeout(successModalTimerRef.current);
    };
  }, [dropdownOpen, authDropdownOpen, notifOpen, avatarAlertOpen, sellerAlertOpen, cartAlertOpen, trackAlertOpen, sellAlertOpen, donateAlertOpen, showAccountModal, confirmDeleteModal, selectedInvoiceOrder, showWhyModal]);

  const isActive = (path) => location.pathname === path;

  const userFullName = user?.name || user?.username || 'User';
  const hasCustomAvatar = user?.avatar && user.avatar.trim() !== '' && user.avatar !== DEFAULT_AVATAR;
  const isSellerUser = Boolean(user?.isSeller);

  const formattedBellBadge = unreadCount > 99 ? '99+' : unreadCount;

  const deliveryTeamAvatar = "/Eco-Cart Delivery Team.jpg";
  const displayAvatar = isDeliveryTeam ? deliveryTeamAvatar : (user?.avatar || DEFAULT_AVATAR);

  // Phone Brands List
  const phoneBrands = [
    {
      name: 'Honor',
      url: 'https://smart-honor.com/serial/verify',
      logo: 'https://cdn.simpleicons.org/honor'
    },
    {
      name: 'Huawei',
      url: 'https://consumer.huawei.com/bd/support/warranty-query/',
      logo: 'https://cdn.simpleicons.org/huawei'
    },
    {
      name: 'Itel',
      url: 'https://www.itel-life.com/bd/support/imei-check',
      logo: 'https://www.google.com/s2/favicons?domain=itel-life.com&sz=128'
    },
    {
      name: 'Motorola',
      url: 'https://en-us.support.motorola.com/app/warranty/check/',
      logo: 'https://cdn.simpleicons.org/motorola'
    },
    {
      name: 'OnePlus',
      url: 'https://service.oneplus.com/in/check#/',
      logo: 'https://cdn.simpleicons.org/oneplus'
    },
    {
      name: 'Oppo',
      url: 'https://support.oppo.com/bd/check/',
      logo: 'https://cdn.simpleicons.org/oppo'
    },
    {
      name: 'Realme',
      url: 'https://www.realme.com/bd/support/phonecheck',
      logo: 'https://www.google.com/s2/favicons?domain=realme.com&sz=128'
    },
    {
      name: 'Symphony',
      url: 'https://symphony-mobile.com/imei',
      logo: 'https://www.google.com/s2/favicons?domain=symphony-mobile.com&sz=128'
    },
    {
      name: 'Tecno',
      url: 'https://www.tecno-mobile.com/bd/warranty/',
      logo: 'https://www.google.com/s2/favicons?domain=tecno-mobile.com&sz=128'
    },
    {
      name: 'Vivo',
      url: 'https://www.vivo.com/bd/support/IMEI',
      logo: 'https://cdn.simpleicons.org/vivo'
    },
    {
      name: 'Xiaomi',
      url: 'https://www.mi.com/global/verify#/en/tab/imei',
      logo: 'https://cdn.simpleicons.org/xiaomi'
    }
  ];

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileSelected} 
      />

      <style>{`
        .navbar-container {
          display: flex;
          flex-direction: column;
          background-color: #1b4332;
          padding: 8px 20px;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          gap: 6px;
        }

        .nav-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .nav-bottom-row {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
          gap: 8px;
          padding-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          flex-wrap: wrap;
        }

        .nav-logo {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.4px;
          transition: transform 0.2s ease, opacity 0.2s ease;
          cursor: pointer;
        }

        .nav-logo:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        /* Continuous Infinite Marquee Ticker Styles */
        .nav-ticker-container {
          flex: 1;
          margin: 0 20px;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 4px 10px;
          border: 1px solid rgba(82, 183, 136, 0.3);
        }

        .nav-ticker-track {
          display: inline-block;
          white-space: nowrap;
          animation: marqueeScroll 18s linear infinite;
          will-change: transform;
        }

        .nav-ticker-text {
          font-size: 0.92rem;
          font-weight: 700;
          font-style: italic;
          color: #ffffff;
          letter-spacing: 0.4px;
          display: inline-block;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .right-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .social-logos-group {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 4px;
        }

        .social-logo-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1.5px solid #52b788;
          background-color: #2d6a4f;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
          text-decoration: none;
        }

        .social-logo-btn:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.4);
        }

        .social-logo-svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
          display: block;
        }

        .nav-link {
          background-color: #2d6a4f;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          padding: 5px 11px;
          border-radius: 6px;
          border: 1.5px solid #52b788;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.84rem;
          display: flex;
          align-items: center;
          gap: 5px;
          position: relative;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
          cursor: pointer;
        }

        .nav-link:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.3);
        }

        .nav-link.active {
          background-color: #52b788;
          color: #081c15;
          border: 1.5px solid #74c69d;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.4);
        }

        @keyframes badgePop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .cart-badge {
          background-color: #e63946;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: bold;
          border-radius: 50%;
          padding: 1px 4px;
          min-width: 14px;
          height: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 3px;
          animation: badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          box-shadow: 0 2px 5px rgba(230, 57, 70, 0.4);
        }

        .bell-badge-abs {
          position: absolute;
          top: -3px;
          right: -3px;
          background-color: #e63946;
          color: #ffffff;
          font-size: 0.62rem;
          font-weight: bold;
          border-radius: 50%;
          padding: 1px 4px;
          min-width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          box-shadow: 0 2px 5px rgba(230, 57, 70, 0.4);
        }

        .btn-sell-pro {
          background-color: #2d6a4f;
          color: #ffffff;
          padding: 5px 11px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.84rem;
          border: 1.5px solid #52b788;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }

        .btn-sell-pro:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.3);
        }

        .btn-sell-pro.active {
          background-color: #52b788;
          color: #081c15;
          border: 1.5px solid #74c69d;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.4);
        }

        .btn-sell-pro.faded-non-seller {
          background-color: #3b5247;
          color: #ffffff;
          border: 1.5px solid #6b8e7b;
          opacity: 0.9;
        }

        .btn-sell-pro.faded-non-seller:hover {
          background-color: #4a6b5c;
          border-color: #8fae9d;
          color: #ffffff;
          box-shadow: 0 3px 12px rgba(107, 142, 123, 0.3);
        }

        .notification-container {
          position: relative;
          display: inline-block;
        }

        .notification-btn {
          background-color: #2d6a4f;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1.5px solid #52b788;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          position: relative;
        }

        .notification-btn:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.4);
        }

        .nav-alert-bubble {
          position: absolute;
          right: 0;
          top: calc(100% + 14px);
          width: auto;
          white-space: nowrap;
          padding: 8px 14px;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          z-index: 1001;
          transform-origin: top right;
          color: #1b4332;
          font-size: 0.86rem;
          font-weight: 750;
          text-align: left;
        }

        .nav-alert-bubble::before {
          content: '';
          position: absolute;
          top: -5px;
          right: 16px;
          width: 9px;
          height: 9px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          transform: rotate(45deg);
          border-radius: 1px;
        }

        .nav-alert-bubble.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .nav-alert-bubble.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }

        .notification-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 14px);
          width: 340px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          z-index: 1001;
          transform-origin: top right;
          color: #1b4332;
          font-size: 0.88rem;
          font-weight: 750;
          text-align: left;
          overflow: visible;
          padding: 6px;
        }

        .notification-dropdown::before {
          content: '';
          position: absolute;
          top: -5px;
          right: 16px;
          width: 9px;
          height: 9px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          transform: rotate(45deg);
          border-radius: 1px;
        }

        .notification-body-scroll {
          max-height: 360px;
          overflow-y: auto;
          padding: 6px 8px;
        }

        .notification-dropdown.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .notification-dropdown.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }

        .notif-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 10px;
          margin-bottom: 6px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .notif-item:hover {
          background: #eaf4ef;
          border-color: #52b788;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(27, 67, 50, 0.08);
        }

        .notif-invoice-link {
          color: #2d6a4f;
          font-weight: 800;
          cursor: pointer;
          display: inline-block;
          transition: all 0.2s ease;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .notif-invoice-link:hover {
          color: #1b4332;
          transform: scale(1.03);
          text-decoration-thickness: 2px;
        }

        .notif-logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 6px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 2px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notif-content-area {
          flex: 1;
        }

        .notif-title {
          font-weight: 800;
          font-size: 0.85rem;
          color: #1b4332;
          margin-bottom: 3px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-msg {
          font-size: 0.8rem;
          color: #4b5563;
          font-weight: 600;
          line-height: 1.35;
        }

        @keyframes dropdownEnter {
          from { opacity: 0; transform: translateY(-6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes dropdownExit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-6px) scale(0.97); }
        }

        .auth-btn {
          background-color: #2d6a4f;
          color: #ffffff;
          border: 1.5px solid #52b788;
          padding: 5px 14px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.84rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }

        .auth-btn:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.3);
        }

        .auth-btn.active {
          background-color: #52b788;
          color: #081c15;
          border: 1.5px solid #74c69d;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.4);
        }

        .profile-container {
          position: relative;
          display: inline-block;
        }

        .user-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          padding: 4px 10px 4px 6px;
          border-radius: 24px;
          border: 1px solid rgba(82, 183, 136, 0.5);
          cursor: pointer;
          color: #ffffff;
          font: inherit;
          transition: transform 0.22s ease, background-color 0.22s ease,
            border-color 0.22s ease, box-shadow 0.22s ease;
          transform-origin: center;
          -webkit-tap-highlight-color: transparent;
        }

        .user-badge:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: #52b788;
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
        }

        .nav-avatar {
          width: 26px;
          height: 26px;
          flex: 0 0 26px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #52b788;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .user-badge:hover .nav-avatar {
          border-color: #b7efcf;
          transform: scale(1.04);
        }

        .user-name {
          font-size: 0.86rem;
          font-weight: 650;
          color: #ffffff;
          max-width: none;
          white-space: nowrap;
        }

        .profile-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          margin-left: 1px;
          border-radius: 50%;
          color: #ffffff;
          background: transparent;
          transition: color 0.2s ease, background-color 0.2s ease,
            box-shadow 0.2s ease, transform 0.22s ease;
        }

        .user-badge:hover .profile-arrow {
          color: #ffffff;
          background: rgba(82, 183, 136, 0.2);
        }

        .profile-arrow.is-open {
          color: #ffffff;
          background: #2d6a4f;
          box-shadow: 0 0 0 2px rgba(82, 183, 136, 0.62),
            0 0 0 4px rgba(82, 183, 136, 0.12);
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 14px);
          width: 240px;
          min-width: 220px;
          padding: 6px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2),
            0 2px 6px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          overflow: visible;
          z-index: 1001;
          transform-origin: top right;
        }

        .dropdown-menu::before {
          content: '';
          position: absolute;
          top: -5px;
          right: 24px;
          width: 9px;
          height: 9px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          transform: rotate(45deg);
          border-radius: 1px;
        }

        .dropdown-menu.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .dropdown-menu.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }

        .dropdown-header {
          padding: 10px 10px 11px;
          margin-bottom: 4px;
          border-bottom: 1px solid #e8eee9;
          background: linear-gradient(135deg, #f5faf6 0%, #ffffff 100%);
          border-radius: 6px 6px 4px 4px;
        }

        .dropdown-user-title {
          display: block;
          font-size: 0.62rem;
          line-height: 1.2;
          color: #6b7b70;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.95px;
        }

        .dropdown-user-name {
          font-size: 0.92rem;
          line-height: 1.35;
          font-weight: 750;
          color: #1b4332;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          padding: 8px 10px;
          margin: 2px 0;
          text-align: left;
          background: #f8f9fa;
          border: 1.5px solid #e5e7eb;
          border-radius: 7px;
          font-family: inherit;
          font-size: 0.86rem;
          font-weight: 650;
          color: #1b4332;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.18s ease, color 0.18s ease,
            transform 0.18s ease, border-color 0.18s ease,
            box-shadow 0.18s ease, padding-left 0.18s ease;
        }

        .dropdown-item:hover {
          background: #1b4332;
          border-color: #1b4332;
          color: #ffffff;
          padding-left: 13px;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(27, 67, 50, 0.2);
        }

        .dropdown-item.danger-action {
          color: #c62828;
          background: #fff5f5;
          border: 1.5px solid #f8dada;
          margin-top: 6px;
        }

        .dropdown-item.danger-action:hover {
          color: #ffffff;
          background: #d9363e;
          border-color: #d9363e;
          box-shadow: 0 4px 10px rgba(217, 54, 62, 0.2);
          padding-left: 13px;
        }

        .auth-phones-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 14px);
          width: 200px;
          padding: 6px 5px 5px 5px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          z-index: 1001;
          transform-origin: top right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .auth-phones-dropdown::before {
          content: '';
          position: absolute;
          top: -5px;
          right: 24px;
          width: 9px;
          height: 9px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          transform: rotate(45deg);
          border-radius: 1px;
          z-index: 1002;
        }

        .auth-phones-dropdown.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .auth-phones-dropdown.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }

        .auth-phones-dropdown .dropdown-item {
          padding: 5px 8px;
          margin: 1px 0;
          font-size: 0.82rem;
          gap: 12px;
        }

        .brand-logo-frame {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }

        .brand-logo-img {
          max-width: 20px;
          max-height: 20px;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 4000;
          animation: ${successModal.closing ? 'fadeOutOverlay 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'fadeInOverlay 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'};
        }

        .success-card {
          background: #ffffff;
          width: 90%;
          max-width: 340px;
          border-radius: 12px;
          padding: 24px 20px;
          box-shadow: 0 10px 30px rgba(27, 67, 50, 0.25);
          border: 1px solid #c8e6c9;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: ${successModal.closing ? 'scaleOutCard 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'scaleInCard 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'};
        }

        .success-tick-circle {
          width: 52px;
          height: 52px;
          background: #e8f5e9;
          border: 2px solid #52b788;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #2d6a4f;
          margin-bottom: 14px;
          box-shadow: 0 3px 10px rgba(82, 183, 136, 0.25);
        }

        .success-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0 0 5px 0;
        }

        .success-message {
          font-size: 0.88rem;
          color: #4b5563;
          font-weight: 600;
          margin: 0;
        }

        .confirm-card {
          background: #ffffff;
          width: 100%;
          max-width: 400px;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          border: 1px solid #e5e7eb;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: scaleInCard 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .confirm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .confirm-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #d32f2f;
          margin: 0;
        }

        .confirm-body {
          font-size: 0.9rem;
          color: #4b5563;
          font-weight: 500;
          margin-bottom: 18px;
          line-height: 1.45;
        }

        .confirm-actions {
          display: flex;
          gap: 8px;
        }

        .btn-confirm-yes {
          flex: 1;
          background-color: #d32f2f;
          color: #ffffff;
          border: none;
          padding: 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-confirm-yes:hover {
          background-color: #b71c1c;
          transform: translateY(-1px);
        }

        .btn-confirm-no {
          flex: 1;
          background-color: #2d6a4f;
          color: #ffffff;
          border: none;
          padding: 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-confirm-no:hover {
          background-color: #1b4332;
          transform: translateY(-1px);
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOutOverlay {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleInCard {
          from { opacity: 0; transform: scale(0.7) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scaleOutCard {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.85) translateY(8px); }
        }
      `}</style>

      <nav className="navbar-container">
        <div className="nav-top-row">
          {isDeliveryTeam ? (
            <span className="nav-logo" style={{ cursor: 'default' }}>
              Eco-Cart 🛍️
            </span>
          ) : (
            <span 
              onClick={(e) => handleLogoHomeClick(e, isNgoRep ? "/donations" : "/")} 
              className="nav-logo"
            >
              Eco-Cart 🛍️
            </span>
          )}

          {/* Continuous Infinite Marquee with 32 Leading Non-Breaking Spaces */}
          <div className="nav-ticker-container">
            <div className="nav-ticker-track">
              <span className="nav-ticker-text">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Welcome to Eco-Cart! Your all-in-one destination to buy, sell and donate with ease. Enjoy convenient delivery and seamless tracking while making a meaningful difference.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Welcome to Eco-Cart! Your all-in-one destination to buy, sell and donate with ease. Enjoy convenient delivery and seamless tracking while making a meaningful difference.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>

          <div className="right-actions-group">
            <div className="social-logos-group">
              <a 
                href="https://www.facebook.com/profile.php?id=61596250734500" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-logo-btn" 
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="social-logo-svg" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/_eco_cart_/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-logo-btn" 
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="social-logo-svg" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/channel/UCVlmiQnLEM1pPeTNHpdoj7A" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-logo-btn" 
                title="YouTube"
                aria-label="YouTube"
              >
                <svg className="social-logo-svg" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {!isDeliveryTeam && (
              <div className="notification-container" ref={notifRef}>
                <button 
                  type="button" 
                  className="notification-btn" 
                  title="Notifications"
                  aria-label="Notifications"
                  onClick={toggleNotif}
                >
                  🔔
                  {unreadCount > 0 && user && (
                    <span key={unreadCount} className="bell-badge-abs">
                      {formattedBellBadge}
                    </span>
                  )}
                </button>

                {notifMounted && (
                  <div className={user && notifications.length > 0 ? `notification-dropdown ${notifOpen ? 'open' : 'closing'}` : `nav-alert-bubble ${notifOpen ? 'open' : 'closing'}`}>
                    {user ? (
                      notifications.length > 0 ? (
                        <div className="notification-body-scroll">
                          <div style={{ fontWeight: '800', marginBottom: '6px', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', color: '#1b4332', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Notifications ({notifications.length})</span>
                          </div>
                          {notifications.map((n, idx) => (
                            <div 
                              key={n._id || idx} 
                              className="notif-item"
                            >
                              <img 
                                src={getNotificationLogo(n)} 
                                alt="" 
                                className="notif-logo-img" 
                              />
                              <div className="notif-content-area">
                                <div className="notif-title">
                                  <span>{n.title}</span>
                                  <span style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 'normal' }}>
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="notif-msg">{renderMessageWithHyperlink(n)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>You have no new notifications</div>
                      )
                    ) : (
                      <div>Please login to see your notifications</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="profile-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-badge"
                  onClick={toggleDropdown}
                  title="Account Menu"
                  aria-label={`Account menu for ${userFullName}`}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                >
                  <img
                    src={displayAvatar}
                    alt=""
                    className="nav-avatar"
                  />
                  <span className="user-name">{userFullName}</span>
                  <span className={`profile-arrow ${dropdownOpen ? 'is-open' : ''}`} aria-hidden="true">
                    ▾
                  </span>
                </button>

                {avatarAlertMounted && (
                  <div className={`nav-alert-bubble ${avatarAlertOpen ? 'open' : 'closing'}`}>
                    <div>You have not added any profile picture</div>
                  </div>
                )}

                {dropdownMounted && (
                  <div
                    className={`dropdown-menu ${dropdownOpen ? 'open' : 'closing'}`}
                    role="menu"
                    aria-label="Account options"
                  >
                    <div className="dropdown-header">
                      <span className="dropdown-user-title">Signed in as</span>
                      <div className="dropdown-user-name">{userFullName}</div>
                    </div>

                    {!isDeliveryTeam && (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            closeDropdown();
                            setShowAccountModal(true);
                          }}
                          className="dropdown-item"
                        >
                          <span aria-hidden="true">📄</span>
                          <span>Account information</span>
                        </button>

                        {hasCustomAvatar ? (
                          <>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={handleChangePictureClick}
                              className="dropdown-item"
                            >
                              <span aria-hidden="true">🖼️</span>
                              <span>Change profile picture</span>
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              onClick={async () => {
                                closeDropdown();
                                try {
                                  const res = await axios.put('http://localhost:5000/api/auth/update-avatar', {
                                    email: user.email,
                                    avatar: ''
                                  });
                                  setUser(res.data.user);
                                  localStorage.setItem('user', JSON.stringify(res.data.user));
                                  showSuccessPopup('Profile picture removed successfully!');
                                } catch (err) {
                                  console.error(err);
                                  alert('Failed to remove profile picture.');
                                }
                              }}
                              className="dropdown-item"
                            >
                              <span aria-hidden="true">👤</span>
                              <span>Remove profile picture</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={handleChangePictureClick}
                              className="dropdown-item"
                            >
                              <span aria-hidden="true">🖼️</span>
                              <span>Add profile picture</span>
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                closeDropdown();
                                triggerAvatarAlert();
                              }}
                              className="dropdown-item"
                            >
                              <span aria-hidden="true">👤</span>
                              <span>Remove profile picture</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleNavClick('/forgot-password')}
                          className="dropdown-item"
                        >
                          <span aria-hidden="true">🔑</span>
                          <span>Forgot password?</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className={`dropdown-item ${isDeliveryTeam ? 'danger-action' : ''}`}
                    >
                      <span aria-hidden="true">🚪</span>
                      <span>Logout</span>
                    </button>

                    {!isDeliveryTeam && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          closeDropdown();
                          setConfirmDeleteModal(true);
                        }}
                        className="dropdown-item danger-action"
                      >
                        <span aria-hidden="true">🗑️</span>
                        <span>Delete account</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link to="/login" className={`auth-btn ${isActive('/login') ? 'active' : ''}`}>
                  🔑 Login
                </Link>
                <Link to="/register" className={`auth-btn ${isActive('/register') ? 'active' : ''}`}>
                  ✨ Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {!isDeliveryTeam && (
          <div className="nav-bottom-row">
            {isNgoRep ? (
              <>
                <Link to="/donations" className={`nav-link ${isActive('/donations') ? 'active' : ''}`}>
                  🎁 Donations
                </Link>

                <Link to="/track-order" className={`nav-link ${isActive('/track-order') ? 'active' : ''}`}>
                  🚚 Track Order
                </Link>
              </>
            ) : (
              <>
                <span 
                  onClick={(e) => handleLogoHomeClick(e, "/")} 
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                >
                  🏠 Home
                </span>

                <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                  📦 Buy Products
                </Link>

                <div className="notification-container" ref={cartAlertRef} style={{ display: 'inline-block' }}>
                  <Link 
                    to="/cart" 
                    className={`nav-link ${isActive('/cart') ? 'active' : ''}`} 
                    onClick={handleCartClick}
                  >
                    🛒 Cart
                    {cartCount > 0 && user && (
                      <span key={cartCount} className="cart-badge">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {cartAlertMounted && (
                    <div className={`nav-alert-bubble ${cartAlertOpen ? 'open' : 'closing'}`}>
                      <div>Please login to add products in your cart</div>
                    </div>
                  )}
                </div>

                <div className="notification-container" ref={trackAlertRef} style={{ display: 'inline-block' }}>
                  <Link 
                    to="/track-order" 
                    className={`nav-link ${isActive('/track-order') ? 'active' : ''}`} 
                    onClick={handleTrackClick}
                  >
                    🚚 Track Order
                  </Link>

                  {trackAlertMounted && (
                    <div className={`nav-alert-bubble ${trackAlertOpen ? 'open' : 'closing'}`}>
                      <div>Please login to track your orders</div>
                    </div>
                  )}
                </div>

                <Link 
                  to="/donations" 
                  className={`nav-link ${isActive('/donations') ? 'active' : ''}`}
                >
                  🎁 Donations
                </Link>

                <button
                  type="button"
                  onClick={() => setShowWhyModal(true)}
                  className="nav-link"
                >
                  💁‍♂️ Why Choose Eco-Cart?
                </button>

                <div className="notification-container" ref={sellerAlertRef} style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <div className="notification-container" ref={sellAlertRef} style={{ display: 'inline-block' }}>
                    <Link 
                      to="/add-product" 
                      className={`btn-sell-pro ${isActive('/add-product') ? 'active' : ''} ${user && !isSellerUser ? 'faded-non-seller' : ''}`} 
                      onClick={handleSellClick}
                    >
                      💰 Sell Items
                    </Link>

                    {sellAlertMounted && (
                      <div className={`nav-alert-bubble ${sellAlertOpen ? 'open' : 'closing'}`}>
                        <div>{user ? "You are not eligible for selling your products" : "Please login to sell your products"}</div>
                      </div>
                    )}
                  </div>

                  <div className="notification-container" ref={donateAlertRef} style={{ display: 'inline-block' }}>
                    <Link 
                      to="/donate-item" 
                      onClick={handleDonateClick}
                      className={`nav-link ${isActive('/donate-item') ? 'active' : ''}`}
                    >
                      🤝 Donate Items
                    </Link>

                    {donateAlertMounted && (
                      <div className={`nav-alert-bubble ${donateAlertOpen ? 'open' : 'closing'}`}>
                        <div>{user ? "Please login to donate your items" : "Please login to donate your items"}</div>
                      </div>
                    )}
                  </div>

                  {showVerifyPhones && (
                    <div className="profile-container" ref={authDropdownRef}>
                      <button
                        type="button"
                        className="user-badge"
                        onClick={toggleAuthDropdown}
                        aria-haspopup="menu"
                        aria-expanded={authDropdownOpen}
                      >
                        <span className="user-name" style={{ marginLeft: '4px' }}>📱 Verify Phones</span>
                        <span className={`profile-arrow ${authDropdownOpen ? 'is-open' : ''}`} aria-hidden="true">
                          ▾
                        </span>
                      </button>

                      {authDropdownMounted && (
                        <div
                          className={`auth-phones-dropdown ${authDropdownOpen ? 'open' : 'closing'}`}
                          role="menu"
                          aria-label="Phone verification portals"
                        >
                          {phoneBrands.map((brand) => (
                            <a
                              key={brand.name}
                              href={brand.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              role="menuitem"
                              className="dropdown-item"
                              onClick={() => closeAuthDropdown()}
                            >
                              <div className="brand-logo-frame">
                                <img 
                                  src={brand.logo} 
                                  alt={`${brand.name} logo`} 
                                  className="brand-logo-img" 
                                />
                              </div>
                              <span>{brand.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </nav>

      <OfferPopup isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} />
      {showWhyModal && <EcoCartWhyModal onClose={() => setShowWhyModal(false)} />}

      {confirmDeleteModal && (
        <div className="success-overlay">
          <div className="confirm-card">
            <div className="confirm-header">
              <h3 className="confirm-title">
                Confirm Deletion 🗑️
              </h3>
            </div>
            <div className="confirm-body">
              Are you sure you want to delete your account? This action cannot be undone.
            </div>
            <div className="confirm-actions">
              <button 
                type="button" 
                className="btn-confirm-yes" 
                onClick={handleExecuteDeleteAccount}
              >
                Yes
              </button>
              <button 
                type="button" 
                className="btn-confirm-no" 
                onClick={() => setConfirmDeleteModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal.show && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-tick-circle">
              ✓
            </div>
            <h3 className="success-title">
              {successModal.message.toLowerCase().includes('deleted') 
                ? 'Deleted Successfully! 🗑️' 
                : 'Success! ✨'}
            </h3>
            <p className="success-message">{successModal.message}</p>
          </div>
        </div>
      )}

      {showAccountModal && (
        <AccountInfoModal user={user} onClose={() => setShowAccountModal(false)} />
      )}

      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </>
  );
};

export default Navbar;