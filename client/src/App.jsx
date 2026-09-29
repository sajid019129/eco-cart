import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import AddProduct from './components/AddProduct';
import ProductSearch from './components/ProductSearch';
import Login from './pages/Login';
import Register from './pages/Register';

// Original Homepage
function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1 style={{ fontSize: '3rem', color: '#1e7e34', fontWeight: 'bold' }}>
        Welcome to Eco-Cart
      </h1>
      <p style={{ fontSize: '1.5rem', color: '#28a745', fontStyle: 'italic', marginTop: '10px' }}>
        From Surplus To Sustainable
      </p>
    </div>
  );
}

// Products & Search Page (Sprint 2 Feature)
function ProductsPage() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async (filters = {}) => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', { params: filters });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <ProductSearch onSearch={fetchProducts} />
      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <h3>Available Eco-Products</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {products.map((p) => (
            <div key={p._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h4>{p.title}</h4>
              <p>{p.description}</p>
              <p><strong>Price:</strong> ${p.price}</p>
              <p><strong>Eco Rating:</strong> 🌱 {p.ecoRating}/5</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;