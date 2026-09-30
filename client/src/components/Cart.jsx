import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user ? (user._id || user.id) : null;

  const fetchCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await axios.put('http://localhost:5000/api/cart/update', {
        userId,
        productId,
        quantity: newQuantity
      });
      setCart(res.data);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/cart/remove/${userId}/${productId}`);
      setCart(res.data);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post('http://localhost:5000/api/cart/checkout', { userId });
      setCheckoutMessage('Order placed successfully! Thank you for supporting sustainable shopping.');
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  if (!userId) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Please log in to view your cart.</h2>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading cart...</div>;
  }

  const items = cart?.items || [];
  const totalPrice = items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h2>Your Shopping Cart</h2>
      {checkoutMessage && (
        <div style={{ padding: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', margin: '20px 0' }}>
          {checkoutMessage}
        </div>
      )}
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {items.map((item) => (
              <div key={item._id || item.product?._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <div>
                  <h4>{item.product?.title || 'Eco Product'}</h4>
                  <p>Price: ${item.product?.price || 0}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => handleUpdateQuantity(item.product?._id, item.quantity - 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.product?._id, item.quantity + 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>+</button>
                  <button onClick={() => handleRemoveItem(item.product?._id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <h3>Total: ${totalPrice.toFixed(2)}</h3>
            <button onClick={handleCheckout} className="btn" style={{ marginTop: '15px', width: 'auto', padding: '10px 25px' }}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;