import React from 'react';

function Home({ user }) {
  return (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.title}>Eco-Cart 🛍️</h1>
        <p style={styles.subtitle}>From Surplus To Sustainable</p>
        {user && (
          <p style={styles.welcomeUser}>
            Logged in as: <strong>{user.name || user.username}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  hero: {
    backgroundColor: '#e8f5e9',
    textAlign: 'center',
    padding: '5rem 1rem',
    borderBottom: '2px solid #c8e6c9',
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: '3.2rem',
    color: '#1b5e20',
    margin: '0',
    fontWeight: '800',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)'
  },
  subtitle: {
    fontSize: '1.6rem',
    color: '#388e3c',
    marginTop: '0.8rem',
    fontStyle: 'italic',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  welcomeUser: {
    fontSize: '1.2rem',
    color: '#2e7d32',
    marginTop: '2rem',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    padding: '0.6rem 1.2rem',
    borderRadius: '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  }
};

export default Home;