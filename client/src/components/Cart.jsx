import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Cart({ user, cart, setCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeUser = user || JSON.parse(localStorage.getItem('user') || 'null');
  const userId = activeUser?.id || activeUser?._id;

  const syncCart = (items) => {
    setCartItems(items);
    if (setCart) setCart(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const fetchCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (!userId) {
      setCartItems(savedCart);
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:5000/api/cart/${userId}`)
      .then((res) => {
        if (res.data?.items && res.data.items.length > 0) {
          syncCart(res.data.items);
        } else {
          setCartItems(savedCart);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('API Error, falling back to local cart:', err);
        setCartItems(savedCart);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const updateQuantity = (productId, currentQty, delta) => {
    const newQuantity = currentQty + delta;
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const updated = cartItems.map((item) => {
      const pId = item.product?._id || item._id;
      if (pId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    syncCart(updated);

    if (userId) {
      axios.put('http://localhost:5000/api/cart/update', {
        userId,
        productId,
        quantity: newQuantity
      }).catch((err) => console.error('Error updating DB quantity:', err));
    }
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => {
      const pId = item.product?._id || item._id;
      return pId !== productId;
    });
    syncCart(updated);

    if (userId) {
      axios.delete(`http://localhost:5000/api/cart/remove/${userId}/${productId}`)
        .catch((err) => console.error('Error removing DB item:', err));
    }
  };

  const handleCheckout = async () => {
    try {
      if (userId) {
        await axios.post('http://localhost:5000/api/cart/checkout', { userId });
      }
      alert('Order Placed Successfully! Thank you for purchasing sustainably.');
      syncCart([]);
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.response?.data?.error || 'Failed to complete checkout.');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || item.price || 0;
      return acc + (price * (item.quantity || 1));
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <p style={{ textAlign: 'center', color: '#1b4332', fontSize: '1.2rem' }}>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.cartContainer}>
        <h2 style={styles.title}>Your Shopping Cart 🛒</h2>

        {cartItems.length > 0 ? (
          <div style={styles.layout}>
            <div style={styles.itemsList}>
              {cartItems.map((item) => {
                const prod = item.product || item;
                if (!prod) return null;

                const productId = prod._id || prod.id;

                return (
                  <div key={productId} style={styles.itemCard}>
                    <div style={styles.itemInfo}>
                      <h3 style={styles.itemTitle}>{prod.name || prod.title}</h3>
                      <span style={styles.itemCategory}>
                        {typeof prod.category === 'object' ? prod.category?.name : (prod.category || 'General')}
                      </span>
                      <span style={styles.itemPrice}>৳ {Number(prod.price || 0).toFixed(2)}</span>
                    </div>

                    <div style={styles.itemActions}>
                      <div style={styles.qtyBox}>
                        <button onClick={() => updateQuantity(productId, item.quantity || 1, -1)} style={styles.qtyBtn}>-</button>
                        <span style={styles.qtyText}>{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(productId, item.quantity || 1, 1)} style={styles.qtyBtn}>+</button>
                      </div>
                      <button onClick={() => removeItem(productId)} style={styles.removeBtn}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>৳ {calculateTotal()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Eco Shipping</span>
                <span style={{ color: '#2b9348', fontWeight: 'bold' }}>FREE</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />
              <div style={{ ...styles.summaryRow, fontSize: '1.2rem', fontWeight: 'bold', color: '#1b4332' }}>
                <span>Total</span>
                <span>৳ {calculateTotal()}</span>
              </div>

              <button 
                onClick={handleCheckout} 
                style={styles.checkoutBtn}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1b4332'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2d6a4f'}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.emptyCart}>
            <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '20px' }}>Your cart is empty.</p>
            <Link 
              to="/products" 
              style={styles.browseBtn}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1b4332';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2d6a4f';
              }}
            >
              Browse Marketplace 🛍️
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#f4f7f6',
    minHeight: 'calc(100vh - 70px)',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  cartContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: '25px',
  },
  layout: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  itemsList: {
    flex: '2 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#2b2b2b',
  },
  itemCategory: {
    fontSize: '0.85rem',
    color: '#666',
  },
  itemPrice: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d6a4f',
    marginTop: '4px',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  qtyBtn: {
    border: 'none',
    backgroundColor: '#f0f0f0',
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  qtyText: {
    padding: '0 12px',
    fontWeight: 'bold',
  },
  removeBtn: {
    backgroundColor: 'transparent',
    color: '#e63946',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
  },
  summaryCard: {
    flex: '1 1 300px',
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    height: 'fit-content',
  },
  summaryTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#1b4332',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    color: '#555',
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'background-color 0.2s ease',
  },
  emptyCart: {
    backgroundColor: '#ffffff',
    padding: '60px',
    textAlign: 'center',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  browseBtn: {
    backgroundColor: '#2d6a4f',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    transition: 'background-color 0.2s ease',
  }
};

export default Cart;