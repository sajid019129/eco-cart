import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>Eco-Cart</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/products" style={styles.link}>Products</Link>
        <Link to="/cart" style={styles.link}>Cart</Link>
        {user ? (
          <>
            <Link to="/add-product" style={styles.link}>Add Product</Link>
            <span style={styles.userGreeting}>Hi, {user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#2e7d32',
    color: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  link: { color: '#fff', textDecoration: 'none', fontWeight: '500' },
  userGreeting: { color: '#e8f5e9', fontWeight: 'bold' },
  logoutBtn: {
    backgroundColor: '#c62828',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Navbar;