import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = ({ userId = '650000000000000000000001' }) => {
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  if (!cart) return <p style={{ textAlign: 'center' }}>Loading cart...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Your Shopping Cart</h2>
      {cart.items && cart.items.length > 0 ? (
        <div>
          {cart.items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.product?.title || 'Product'}</span>
              <span>Qty: {item.quantity}</span>
              <span>${(item.product?.price || 0) * item.quantity}</span>
            </div>
          ))}
          <h3 style={{ textAlign: 'right', marginTop: '15px' }}>
            Total: ${cart.items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)}
          </h3>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;