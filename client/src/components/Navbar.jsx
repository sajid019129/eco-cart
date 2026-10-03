import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🌱 Eco-Cart
      </Link>

      <div className="navbar-links">
        <Link to="/products">Browse Goods</Link>

        {user ? (
          <>
            <Link to="/add-product">+ Sell Item</Link>
            <Link to="/cart">🛒 Cart</Link>
            <div className="navbar-user">
              <img
                src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                alt={user.name}
                className="user-avatar"
              />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;