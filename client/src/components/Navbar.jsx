import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AccountInfoModal from './AccountInfoModal';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const Navbar = ({ user, setUser, setCart, cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMounted, setNotifMounted] = useState(false);

  const [avatarAlertOpen, setAvatarAlertOpen] = useState(false);
  const [avatarAlertMounted, setAvatarAlertMounted] = useState(false);

  const [sellerAlertOpen, setSellerAlertOpen] = useState(false);
  const [sellerAlertMounted, setSellerAlertMounted] = useState(false);

  const [cartAlertOpen, setCartAlertOpen] = useState(false);
  const [cartAlertMounted, setCartAlertMounted] = useState(false);

  const [trackAlertOpen, setTrackAlertOpen] = useState(false);
  const [trackAlertMounted, setTrackAlertMounted] = useState(false);

  const [showAccountModal, setShowAccountModal] = useState(false);

  // Custom center success modal state
  const [successModal, setSuccessModal] = useState({ show: false, closing: false, message: '' });

  // Delete account confirmation modal state
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const sellerAlertRef = useRef(null);
  const cartAlertRef = useRef(null);
  const trackAlertRef = useRef(null);
  const fileInputRef = useRef(null);
  const closeTimerRef = useRef(null);
  const notifCloseTimerRef = useRef(null);
  const autoHideTimerRef = useRef(null);
  const avatarAlertTimerRef = useRef(null);
  const sellerAlertTimerRef = useRef(null);
  const cartAlertTimerRef = useRef(null);
  const trackAlertTimerRef = useRef(null);
  const successModalTimerRef = useRef(null);

  const closeAllDropdowns = () => {
    if (dropdownOpen) closeDropdown();
    if (notifOpen) closeNotif();
    if (avatarAlertOpen) closeAvatarAlert();
    if (sellerAlertOpen) closeSellerAlert();
    if (cartAlertOpen) closeCartAlert();
    if (trackAlertOpen) closeTrackAlert();
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

  const openNotif = () => {
    if (notifCloseTimerRef.current) clearTimeout(notifCloseTimerRef.current);
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    closeAllDropdowns();

    setNotifMounted(true);
    setNotifOpen(true);

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

  // Trigger custom center success modal with smooth transition and extended stay time (3 seconds)
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
    navigate('/login');
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
      if (sellerAlertOpen) closeSellerAlert();
      else triggerSellerAlert();
      return;
    }
    // If user is logged in but NOT a seller, prevent navigation and show alert popup
    if (!user.isSeller) {
      e.preventDefault();
      if (sellerAlertOpen) closeSellerAlert();
      else triggerSellerAlert();
    }
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
    reader.onloadend = async () => {
      const base64Avatar = reader.result;
      try {
        const res = await axios.put('http://localhost:5000/api/auth/update-avatar', {
          email: user.email,
          avatar: base64Avatar
        });
        
        const updatedUserObj = res.data.user;
        setUser(updatedUserObj);
        localStorage.setItem('user', JSON.stringify(updatedUserObj));
        showSuccessPopup('Profile picture updated successfully!');
      } catch (err) {
        console.error('Failed to update picture:', err);
        alert(err.response?.data?.message || 'Failed to update profile picture.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (dropdownOpen) closeDropdown();
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
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAllDropdowns();
        if (showAccountModal) setShowAccountModal(false);
        if (confirmDeleteModal) setConfirmDeleteModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (notifCloseTimerRef.current) clearTimeout(notifCloseTimerRef.current);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      if (avatarAlertTimerRef.current) clearTimeout(avatarAlertTimerRef.current);
      if (sellerAlertTimerRef.current) clearTimeout(sellerAlertTimerRef.current);
      if (cartAlertTimerRef.current) clearTimeout(cartAlertTimerRef.current);
      if (trackAlertTimerRef.current) clearTimeout(trackAlertTimerRef.current);
      if (successModalTimerRef.current) clearTimeout(successModalTimerRef.current);
    };
  }, [dropdownOpen, notifOpen, avatarAlertOpen, sellerAlertOpen, cartAlertOpen, trackAlertOpen, showAccountModal, confirmDeleteModal]);

  const isActive = (path) => location.pathname === path;

  const userFullName = user?.name || user?.username || 'User';
  const hasCustomAvatar = user?.avatar && user.avatar.trim() !== '' && user.avatar !== DEFAULT_AVATAR;
  const isSellerUser = Boolean(user?.isSeller);

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
          justify-content: space-between;
          align-items: center;
          background-color: #1b4332;
          padding: 12px 24px;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          flex-wrap: nowrap;
          gap: 20px;
        }

        .nav-left-group {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
        }

        .nav-logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .nav-logo:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .right-actions-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .nav-link {
          background-color: #2d6a4f;
          color: #d8f3dc;
          text-decoration: none;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 8px;
          border: 2px solid #52b788;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.93rem;
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .nav-link:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.3);
        }

        .nav-link.active {
          background-color: #52b788;
          color: #081c15;
          border: 2px solid #74c69d;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
        }

        @keyframes badgePop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .cart-badge {
          background-color: #e63946;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: bold;
          border-radius: 50%;
          padding: 2px 5px;
          min-width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          animation: badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          box-shadow: 0 2px 6px rgba(230, 57, 70, 0.4);
        }

        @keyframes sellZoomPulseFast {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }

        .btn-sell-pro {
          background-color: #2d6a4f;
          color: #ffffff;
          padding: 7px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.93rem;
          border: 2px solid #52b788;
          cursor: pointer;
          transition: all 0.2s ease;
          animation: sellZoomPulseFast 0.45s infinite ease-in-out;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .btn-sell-pro:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          box-shadow: 0 4px 14px rgba(82, 183, 136, 0.4);
        }

        .btn-sell-pro.active {
          animation: none;
          background-color: #52b788;
          color: #081c15;
          border: 2px solid #74c69d;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
        }

        .btn-sell-pro.faded-non-seller {
          background-color: #3b5247;
          color: #b0c4b8;
          border: 2px solid #6b8e7b;
          opacity: 0.75;
        }

        .btn-sell-pro.faded-non-seller:hover {
          background-color: #4a6b5c;
          border-color: #8fae9d;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(107, 142, 123, 0.3);
        }

        .notification-container {
          position: relative;
          display: inline-block;
        }

        .notification-btn {
          background-color: #2d6a4f;
          color: #ffffff;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 2px solid #52b788;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .notification-btn:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
        }

        .notification-dropdown {
          position: absolute;
          right: -10px;
          top: calc(100% + 14px);
          white-space: nowrap;
          padding: 12px 18px;
          background: #ffffff;
          border-radius: 13px;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.23), 0 3px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          z-index: 1001;
          transform-origin: top right;
          color: #1b4332;
          font-size: 0.92rem;
          font-weight: 750;
          text-align: center;
        }

        .notification-dropdown::before {
          content: '';
          position: absolute;
          top: -7px;
          right: 22px;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          transform: rotate(45deg);
          border-radius: 2px;
        }

        /* Variant for left-aligned dropdowns (Cart & Track Order) so the arrow points to the left side */
        .notification-dropdown.left-aligned {
          left: 0;
          right: auto;
          transform-origin: top left;
        }

        .notification-dropdown.left-aligned::before {
          right: auto;
          left: 22px;
        }

        .notification-dropdown.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .notification-dropdown.closing {
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

        .auth-btn {
          background-color: #2d6a4f;
          color: #ffffff;
          border: 2px solid #52b788;
          padding: 7px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.93rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .auth-btn:hover {
          background-color: #52b788;
          border-color: #74c69d;
          color: #081c15;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.3);
        }

        .auth-btn.active {
          background-color: #52b788;
          color: #081c15;
          border: 2px solid #74c69d;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
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
          padding: 5px 12px 5px 6px;
          border-radius: 30px;
          border: 1px solid rgba(82, 183, 136, 0.4);
          cursor: pointer;
          color: #ffffff;
          font: inherit;
          transition: transform 0.22s ease, background-color 0.22s ease,
            border-color 0.22s ease, box-shadow 0.22s ease;
          transform-origin: center;
          -webkit-tap-highlight-color: transparent;
        }

        .user-badge:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: #52b788;
          transform: translateY(-1px) scale(1.025);
          box-shadow: 0 5px 16px rgba(0, 0, 0, 0.16);
        }

        .nav-avatar {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #52b788;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .user-badge:hover .nav-avatar {
          border-color: #b7efcf;
          transform: scale(1.04);
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 650;
          color: #ffffff;
          max-width: none;
          white-space: nowrap;
        }

        .profile-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          flex: 0 0 24px;
          margin-left: 2px;
          border-radius: 50%;
          color: #d8f3dc;
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
          width: 250px;
          min-width: 230px;
          padding: 6px;
          background: #ffffff;
          border-radius: 13px;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.23),
            0 3px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: visible;
          z-index: 1001;
          transform-origin: top right;
        }

        .dropdown-menu::before {
          content: '';
          position: absolute;
          top: -7px;
          right: 28px;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          transform: rotate(45deg);
          border-radius: 2px;
        }

        .dropdown-menu.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .dropdown-menu.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }

        .dropdown-header {
          padding: 12px 11px 13px;
          margin-bottom: 5px;
          border-bottom: 1px solid #e8eee9;
          background: linear-gradient(135deg, #f5faf6 0%, #ffffff 100%);
          border-radius: 8px 8px 5px 5px;
        }

        .dropdown-user-title {
          display: block;
          font-size: 0.68rem;
          line-height: 1.3;
          color: #6b7b70;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 1.05px;
        }

        .dropdown-user-name {
          font-size: 0.98rem;
          line-height: 1.45;
          font-weight: 750;
          color: #1b4332;
          margin-top: 4px;
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
          padding: 10px 11px;
          margin: 3px 0;
          text-align: left;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.91rem;
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
          padding-left: 15px;
          transform: translateY(-1px);
          box-shadow: 0 5px 12px rgba(27, 67, 50, 0.22);
        }

        .dropdown-item.danger-action {
          color: #c62828;
          background: #fff5f5;
          border: 1px solid #f8dada;
          margin-top: 7px;
        }

        .dropdown-item.danger-action:hover {
          color: #ffffff;
          background: #d9363e;
          border-color: #d9363e;
          box-shadow: 0 5px 12px rgba(217, 54, 62, 0.22);
          padding-left: 15px;
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
          max-width: 360px;
          border-radius: 14px;
          padding: 28px 24px;
          box-shadow: 0 12px 36px rgba(27, 67, 50, 0.25);
          border: 1px solid #c8e6c9;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: ${successModal.closing ? 'scaleOutCard 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'scaleInCard 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'};
        }

        .success-tick-circle {
          width: 60px;
          height: 60px;
          background: #e8f5e9;
          border: 2px solid #52b788;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: #2d6a4f;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.25);
        }

        .success-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0 0 6px 0;
        }

        .success-message {
          font-size: 0.92rem;
          color: #4b5563;
          font-weight: 600;
          margin: 0;
        }

        .confirm-card {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          border: 1px solid #e5e7eb;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: scaleInCard 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .confirm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .confirm-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #d32f2f;
          margin: 0;
        }

        .confirm-body {
          font-size: 0.95rem;
          color: #4b5563;
          font-weight: 500;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .confirm-actions {
          display: flex;
          gap: 10px;
        }

        .btn-confirm-yes {
          flex: 1;
          background-color: #d32f2f;
          color: #ffffff;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.95rem;
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
          padding: 10px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.95rem;
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
          from { opacity: 0; transform: scale(0.7) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scaleOutCard {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.85) translateY(10px); }
        }
      `}</style>

      <nav className="navbar-container">
        <div className="nav-left-group">
          <Link to="/" className="nav-logo">
            Eco-Cart 🛍️
          </Link>

          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              🏠 Home
            </Link>

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
                <div className={`notification-dropdown left-aligned ${cartAlertOpen ? 'open' : 'closing'}`}>
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
                <div className={`notification-dropdown left-aligned ${trackAlertOpen ? 'open' : 'closing'}`}>
                  <div>Please login to track your orders</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="right-actions-group">
          <div className="notification-container" ref={notifRef}>
            <button 
              type="button" 
              className="notification-btn" 
              title="Notifications"
              aria-label="Notifications"
              onClick={toggleNotif}
            >
              🔔
            </button>

            {notifMounted && (
              <div className={`notification-dropdown ${notifOpen ? 'open' : 'closing'}`}>
                {user ? (
                  <div>You have no new notifications</div>
                ) : (
                  <div>Please login to see your notifications</div>
                )}
              </div>
            )}
          </div>

          <div className="notification-container" ref={sellerAlertRef}>
            <Link 
              to="/add-product" 
              className={`btn-sell-pro ${isActive('/add-product') ? 'active' : ''} ${user && !isSellerUser ? 'faded-non-seller' : ''}`} 
              onClick={handleSellClick}
            >
              💰 Sell Items
            </Link>

            {sellerAlertMounted && (
              <div className={`notification-dropdown ${sellerAlertOpen ? 'open' : 'closing'}`} style={{ right: '0px', top: 'calc(100% + 14px)' }}>
                <div>
                  {!user 
                    ? 'Please login to sell your products' 
                    : 'You are not eligible for selling products'}
                </div>
              </div>
            )}
          </div>

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
                  src={user.avatar || DEFAULT_AVATAR}
                  alt=""
                  className="nav-avatar"
                />
                <span className="user-name">{userFullName}</span>
                <span className={`profile-arrow ${dropdownOpen ? 'is-open' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              {avatarAlertMounted && (
                <div className={`notification-dropdown ${avatarAlertOpen ? 'open' : 'closing'}`} style={{ right: '10px', top: 'calc(100% + 14px)' }}>
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

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="dropdown-item"
                  >
                    <span aria-hidden="true">🚪</span>
                    <span>Logout</span>
                  </button>

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
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link to="/login" className={`auth-btn ${isActive('/login') ? 'active' : ''}`}>
                🔑 Login
              </Link>
              <Link to="/register" className={`auth-btn ${isActive('/register') ? 'active' : ''}`}>
                ✨ Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Product-Style Confirmation Deletion Modal matching App.jsx */}
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

      {/* Centered Animated Success Modal with Checkmark */}
      {successModal.show && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-tick-circle">
              ✓
            </div>
            <h3 className="success-title">Deleted Successfully! 🗑️</h3>
            <p className="success-message">{successModal.message}</p>
          </div>
        </div>
      )}

      {showAccountModal && (
        <AccountInfoModal user={user} onClose={() => setShowAccountModal(false)} />
      )}
    </>
  );
};

export default Navbar;