import { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    fetch(`${apiUrl}/api/products`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛹 Skateshop Online Store</h1>
      
      {loading && <p style={{ color: 'orange' }}>Waking up the server and loading products...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
              <p style={{ margin: 0, color: '#666' }}>{product.description}</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: product.quantity > 0 ? 'green' : 'red' }}>
                {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>${product.price}</p>
              <button style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;