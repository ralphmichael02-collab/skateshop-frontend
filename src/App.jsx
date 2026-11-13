import { useState, useEffect } from 'react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [apiUrl] = useState(import.meta.env.VITE_API_URL);

  // State for the new product form
  const [newProd, setNewProd] = useState({ name: '', price: '', description: '', sku: '', stock: '' });

  const fetchProducts = () => {
    fetch(`${apiUrl}/api/products`).then(res => res.json()).then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000); 
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleRestock = async (productId) => {
    const amountStr = window.prompt("How many items are you restocking?");
    const amount = parseInt(amountStr);
    if (!amount || isNaN(amount)) return;

    await fetch(`${apiUrl}/api/restock`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, amount: amount })
    });
    fetchProducts(); 
  };

  // NEW: Submit handler for adding a product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const response = await fetch(`${apiUrl}/api/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProd, initial_stock: parseInt(newProd.stock) })
    });

    if (response.ok) {
      alert("Product added to Cloud! It will sync to the Local POS shortly.");
      setNewProd({ name: '', price: '', description: '', sku: '', stock: '' }); // Clear form
      fetchProducts();
    } else {
      const err = await response.json();
      alert("Error: " + err.error);
    }
  };

  const handleCheckout = async () => {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0).toFixed(2);
    await fetch(`${apiUrl}/api/store-checkout`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, totalAmount })
    });
    setCart([]); fetchProducts(); alert("Order Placed!");
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      
      {/* ADMIN FORM SECTION */}
      <div style={{ padding: '1rem', border: '2px dashed #f39c12', marginBottom: '2rem', borderRadius: '8px' }}>
        <h3>Admin: Add New Product</h3>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input required placeholder="Name" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
          <input required placeholder="SKU (e.g., BRG-001)" value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} />
          <input required placeholder="Price" type="number" step="0.01" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} />
          <input required placeholder="Description" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} />
          <input required placeholder="Initial Stock" type="number" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} />
          <button type="submit" style={{ backgroundColor: '#f39c12', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Product</button>
        </form>
      </div>

      <h1>🛹 Online Store</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '250px' }}>
            <h3>{p.name} - ${p.price}</h3>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>SKU: {p.sku}</p>
            <p>{p.description}</p>
            <p>Stock: {p.quantity}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => setCart([...cart, { ...p, cartQuantity: 1 }])} style={{ padding: '0.5rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>Add to Cart</button>
              <button onClick={() => handleRestock(p.id)} style={{ padding: '0.5rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>Restock</button>
            </div>
          </div>
        ))}
      </div>
      
      {cart.length > 0 && <button onClick={handleCheckout} style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'green', color: 'white' }}>Checkout</button>}
    </div>
  );
}