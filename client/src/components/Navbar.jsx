import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const Navbar = ({ user, setUser, setCart, cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMounted, setNotifMounted] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const closeTimerRef = useRef(null);
  const notifCloseTimerRef = useRef(null);
  const autoHideTimerRef = useRef(null);

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
      if (notifOpen) closeNotif();
      openDropdown();
    }
  };

  const openNotif = () => {
    if (notifCloseTimerRef.current) clearTimeout(notifCloseTimerRef.current);
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);

    setNotifMounted(true);
    setNotifOpen(true);

    // Auto dismiss after 3.5 seconds if logged out
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
      if (dropdownOpen) closeDropdown();
      openNotif();
    }
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

  const handleNavClick = (path) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDropdownOpen(false);
    setDropdownMounted(false);
    navigate(path);
  };

  const handleProtectedNav = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (dropdownOpen) closeDropdown();
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        if (notifOpen) closeNotif();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (dropdownOpen) closeDropdown();
        if (notifOpen) closeNotif();
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
    };
  }, [dropdownOpen, notifOpen]);

  const isActive = (path) => location.pathname === path;

  // Resolve user display name properly
  const userFullName = user?.name || user?.username || 'User';

  return (
    <>
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

        /* Modern Box-Button Navigation Links */
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

        /* Active State: Bold text with black color and highlighted border */
        .nav-link.active {
          background-color: #52b788;
          color: #081c15;
          border: 2px solid #74c69d;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
        }

        @keyframes badgePop {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          60% {
            transform: scale(1.25);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
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
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
          100% {
            transform: scale(1);
          }
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

        /* Notification Bell Container & Dropdown with Sharp Arrow */
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

        /* Sharp arrow pointing from the right upper side directly to the bell */
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

        .notification-dropdown.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .notification-dropdown.closing {
          animation: dropdownExit 0.18s ease-in both;
          pointer-events: none;
        }

        /* Identical Uniform Styling for Login & Register Buttons (White text when not selected) */
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

        /* Profile dropdown */
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

        .user-badge:focus-visible {
          outline: 2px solid #95d5b2;
          outline-offset: 3px;
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
          top: calc(100% + 12px);
          width: 250px;
          min-width: 230px;
          padding: 6px;
          background: #ffffff;
          border-radius: 13px;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.23),
            0 3px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          z-index: 1001;
          transform-origin: top right;
        }

        .dropdown-menu.open {
          animation: dropdownEnter 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .dropdown-menu.closing {
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

        .dropdown-item:focus-visible {
          outline: 2px solid #52b788;
          outline-offset: 1px;
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

        @media (prefers-reduced-motion: reduce) {
          .user-badge, .nav-avatar, .profile-arrow, .dropdown-item, .btn-sell-pro, .notification-btn, .nav-link, .auth-btn, .notification-dropdown {
            transition: none;
            animation: none;
          }
        }
      `}</style>

      <nav className="navbar-container">
        {/* Left Group: Logo + Main Navigation Links */}
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

            <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`} onClick={(e) => handleProtectedNav(e, '/cart')}>
              🛒 Cart
              {cartCount > 0 && user && (
                <span key={cartCount} className="cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/track-order" className={`nav-link ${isActive('/track-order') ? 'active' : ''}`} onClick={(e) => handleProtectedNav(e, '/track-order')}>
              🚚 Track Order
            </Link>
          </div>
        </div>

        {/* Right Group: Notifications, Sell Items, and Profile Dropdown */}
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
                  <div>You have no new notifications.</div>
                ) : (
                  <div>Please login to see your notifications</div>
                )}
              </div>
            )}
          </div>

          <Link to="/add-product" className={`btn-sell-pro ${isActive('/add-product') ? 'active' : ''}`} onClick={(e) => handleProtectedNav(e, '/add-product')}>
            💰 Sell Items
          </Link>

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
                    onClick={() => handleNavClick('/account-info')}
                    className="dropdown-item"
                  >
                    <span aria-hidden="true">📄</span>
                    <span>Account information</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleNavClick('/change-profile-pic')}
                    className="dropdown-item"
                  >
                    <span aria-hidden="true">🖼️</span>
                    <span>Change profile picture</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      if (setUser) setUser(prev => ({ ...prev, avatar: '' }));
                      closeDropdown();
                    }}
                    className="dropdown-item"
                  >
                    <span aria-hidden="true">👤</span>
                    <span>Remove profile picture</span>
                  </button>

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
                    onClick={() => handleNavClick('/delete-account')}
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
    </>
  );
};

export default Navbar;