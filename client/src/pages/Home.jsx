import React from 'react';
import ProductSearch from '../components/ProductSearch';

const Home = () => {
  return (
    <div>
      <div style={{
        backgroundColor: '#2e2e54',
        color: 'white',
        padding: '3rem 1rem',
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Second-Hand & Declutter Marketplace</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Buy gently used goods or post your pre-loved items for sale in seconds.</p>
      </div>

      <ProductSearch />
    </div>
  );
};

export default Home;