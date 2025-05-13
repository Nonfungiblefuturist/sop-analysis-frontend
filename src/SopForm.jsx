import React, { useState } from 'react';

const SopForm = () => {
  const [sopText, setSopText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/analyze-sop`, {        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sopText }),
      });

      const data = await response.json();
      setResult(data.analysis || data.raw_analysis || data);
    } catch (error) {
      console.error(error);
      setResult({ error: 'Failed to connect to backend. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: '0 auto' }}>
      <h2>SOP Analyzer</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={sopText}
          onChange={(e) => setSopText(e.target.value)}
          placeholder="Paste your SOP here..."
          rows={10}
          style={{ width: '100%', padding: 10 }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 10,
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze SOP'}
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20, background: '#f9f9f9', padding: 10, borderRadius: 4 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default SopForm;