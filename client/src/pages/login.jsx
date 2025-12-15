import React, { useState } from "react";
import { FiMail } from "react-icons/fi";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) return alert("Enter a valid email");
    onLogin(email);
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1 className="brand">CUPI Dashboard</h1>
        <p className="muted">Enter your college email to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="input-label">
            <FiMail />
            <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />

          </label>
          <button className="btn primary" type="submit">Enter</button>
        </form>

        <small className="hint">Pick stocks and see live prices — no refresh needed.</small>
      </div>
    </div>
  );
}
