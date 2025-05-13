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
      const response = await fetch("https://sop-analysis-backend.onrender.com/analyze-sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sopText }),
      });

      const data = await response.json();
      setResult(data.analysis || data.raw_analysis || data);
    } catch (err) {
      setResult({ error: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h2>SOP Analyzer</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={sopText}
          onChange={(e) => setSopText(e.target.value)}
          placeholder="Paste SOP here"
          rows={10}
          style={{ width: "100%" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20, background: "#f0f0f0", padding: 10 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default SopForm;