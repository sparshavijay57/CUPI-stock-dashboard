import React, { useEffect, useState } from "react";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");

  useEffect(() => {
    if (email) localStorage.setItem("email", email);
    else localStorage.removeItem("email");
  }, [email]);

  return (
    <div className="app-root">
      {email ? (
        <Dashboard email={email} onLogout={() => setEmail("")} />
      ) : (
        <Login onLogin={(e) => setEmail(e)} />
      )}
    </div>
  );
}
