import React, { useState } from "react";

export default function Login({ onAuth }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const PIN_CORRECTO = "0753";

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === PIN_CORRECTO) onAuth();
    else { setError(true); setPin(""); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace" }}>
      <form onSubmit={handleLogin} style={{ background: "#0d1629", padding: "2rem", borderRadius: 10, border: "1px solid #1e293b", textAlign: "center", width: 320 }}>
        <h2 style={{ color: "#dde8f0", marginBottom: "1.5rem", fontSize: "1.1rem" }}>🔒 Taller Restringido</h2>
        <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setError(false); }} placeholder="Ingresa tu PIN..." autoFocus style={{ width: "100%", padding: "0.75rem", background: "#0a111e", border: `1px solid ${error ? "#ef4444" : "#243044"}`, borderRadius: 7, color: "#dde8f0", marginBottom: "1rem", textAlign: "center", letterSpacing: "0.2em" }} />
        {error && <div style={{ color: "#ef4444", fontSize: "0.75rem", marginBottom: "1rem" }}>PIN Incorrecto</div>}
        <button type="submit" style={{ width: "100%", padding: "0.75rem", background: "#3b82f6", border: "none", borderRadius: 7, color: "#fff", fontWeight: "bold", cursor: "pointer" }}>Desbloquear</button>
      </form>
    </div>
  );
}
