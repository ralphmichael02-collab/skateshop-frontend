import { useState, useEffect } from 'react';

function App() {
  const [backendData, setBackendData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This uses the Vercel environment variable, or falls back to localhost if missing
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    fetch(`${apiUrl}/api/health`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to connect to the API');
        return response.json();
      })
      .then((data) => {
        setBackendData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🛹 Skateshop Cloud Status</h1>
      
      {loading && (
        <p style={{ color: 'orange' }}>
          Connecting to cloud database... <br />
          <small>(If this is the first visit in a while, Render may be waking up. Please wait up to 60 seconds.)</small>
        </p>
      )}
      
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}
      
      {backendData && (
        <div style={{ border: '2px solid green', padding: '1rem', marginTop: '1rem', borderRadius: '8px', display: 'inline-block', textAlign: 'left' }}>
          <h2 style={{ color: 'green', marginTop: 0 }}>✅ {backendData.message}</h2>
          <p><strong>Database Time:</strong> {backendData.db_time}</p>
          <p><small>Hosted on Aiven Cloud</small></p>
        </div>
      )}
    </div>
  );
}

export default App;