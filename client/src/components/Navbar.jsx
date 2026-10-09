import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const Navbar = ({ user, setUser, setCart, cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    if (setCart) setCart([]);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #1b4332;
          padding: 14px 28px;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-logo {
          font-size: 1.6rem;
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
          gap: 16px;
        }

        .nav-link {
          color: #d8f3dc;
          text-decoration: none;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-size: 0.98rem;
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .nav-link.active {
          background-color: rgba(82, 183, 136, 0.25);
          color: #52b788;
          border-bottom: 2px solid #52b788;
        }

        .cart-badge {
          background-color: #e63946;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: bold;
          border-radius: 50%;
          padding: 2px 6px;
          min-width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
        }

        .btn-login {
          border: 1.5px solid #ffffff;
          color: #ffffff;
          padding: 8px 18px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .btn-login:hover {
          background-color: #ffffff;
          color: #1b4332;
          box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .btn-action {
          background-color: #52b788;
          color: #081c15;
          padding: 8px 18px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action:hover {
          background-color: #74c69d;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.4);
          transform: translateY(-2px);
        }

        .btn-logout {
          background-color: #e76f51;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background-color: #d62828;
          box-shadow: 0 4px 10px rgba(231, 111, 81, 0.4);
          transform: translateY(-2px);
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px 12px 4px 6px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #52b788;
        }

        .user-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: #ffffff;
        }
      `}</style>

      <nav className="navbar-container">
        <Link to="/" className="nav-logo">
          Eco-Cart 🛍️
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>

          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
            Products
          </Link>

          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
            Cart 🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              <Link to="/add-product" className="btn-action">
                + Sell Item
              </Link>
              
              <div className="user-badge">
                <img 
                  src={user.avatar || DEFAULT_AVATAR} 
                  alt="Profile" 
                  className="nav-avatar" 
                />
                <span className="user-name">{user.name || user.username || 'User'}</span>
              </div>

              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Login
              </Link>

              <Link to="/register" className="btn-action">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;