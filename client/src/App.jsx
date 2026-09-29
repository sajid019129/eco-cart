import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import AddProduct from './components/AddProduct';
import ProductSearch from './components/ProductSearch';

function App() {
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
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <ProductSearch onSearch={fetchProducts} />
        <AddProduct onProductAdded={fetchProducts} />
        <div style={{ maxWidth: '800px', margin: '20px auto' }}>
          <h3>Available Products</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {products.map((p) => (
              <div key={p._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h4>{p.title}</h4>
                <p>{p.description}</p>
                <p><strong>Price:</strong> ${p.price}</p>
                <p><strong>Category:</strong> {p.category?.name || 'Uncategorized'}</p>
                <p><strong>Eco Rating:</strong> 🌱 {p.ecoRating}/5</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;