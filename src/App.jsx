import { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Moved fetch outside useEffect so we can call it after restocking
  const fetchProducts = () => {
    fetch(`${apiUrl}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [apiUrl]);

  const handleRestock = async (productId) => {
    const amountStr = window.prompt("How many items are you restocking?");
    const amount = parseInt(amountStr);
    
    if (!amount || isNaN(amount)) return;

    try {
      const response = await fetch(`${apiUrl}/api/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, amount: amount })
      });
      
      if (response.ok) {
        alert(`Successfully restocked ${amount} items!`);
        fetchProducts(); // Refresh the list to show new stock
      }
    } catch (err) {
      alert("Restock failed");
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${apiUrl}/api/store-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, totalAmount: calculateTotal() })
      });
      
      if (!response.ok) throw new Error('Checkout failed');
      
      alert('Online Order Placed Successfully!');
      setCart([]); 
      fetchProducts(); // Refresh products after checkout
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
      
      {/* LEFT SIDE: STORE PRODUCTS */}
      <div style={{ flex: 2, padding: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🛹 Skateshop Online Store</h1>
        {loading ? <p>Waking up server and loading...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            {products.map((product) => (
              <div key={product.id} style={{ backgroundColor: '#2a2a2a', border: '1px solid #444', padding: '1rem', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{product.description}</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${product.price}</p>
                <p style={{ color: product.quantity > 0 ? '#4caf50' : '#f44336' }}>In Stock: {product.quantity}</p>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                    style={{ flex: 1, padding: '0.5rem', backgroundColor: product.quantity > 0 ? '#0070f3' : '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: product.quantity > 0 ? 'pointer' : 'not-allowed' }}>
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => handleRestock(product.id)}
                    style={{ padding: '0.5rem', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE: SHOPPING CART */}
      <div style={{ flex: 1, backgroundColor: '#111', padding: '2rem', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <h2>Your Cart</h2>
        <div style={{ flex: 1, marginTop: '1rem' }}>
          {cart.length === 0 && <p style={{ color: '#888' }}>Cart is empty.</p>}
          {cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>{item.name} x {item.cartQuantity}</div>
              <div>${(item.price * item.cartQuantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '2px solid #444', paddingTop: '1rem' }}>
          <h2 style={{ display: 'flex', justifyContent: 'space-between' }}>Total: <span>${calculateTotal()}</span></h2>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            style={{ width: '100%', padding: '1rem', marginTop: '1rem', backgroundColor: cart.length === 0 ? '#444' : '#4caf50', color: 'white', fontSize: '1rem', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}>
            {isProcessing ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;