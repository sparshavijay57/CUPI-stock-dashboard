import React, { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import StockCard from "../components/StockCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard({ email, onLogout }) {
  const [supported, setSupported] = useState([]);
  const [prices, setPrices] = useState({});
  const [subs, setSubs] = useState(new Set());
  const [sparks, setSparks] = useState({}); // symbol -> recent values array
  const prevPrices = useRef({});

  useEffect(()=> {
    // fetch supported stocks
    fetch(`${API}/api/stocks`).then(r=>r.json()).then(data => {
      setSupported(data.supported);
      setPrices(data.prices);
      // init sparks
      const init = {};
      data.supported.forEach(s => init[s] = [data.prices[s]]);
      setSparks(init);
    });
  }, []);

  useEffect(()=> {
    // connect and identify
    socket.connect();
    socket.emit("identify", { email });

    // get initial subs
    socket.emit("get-subs", { email });
    socket.on("subs", (list) => setSubs(new Set(list)));

    socket.on("prices", (updates) => {
      setPrices(prev => {
        const next = { ...prev };
        Object.keys(updates).forEach(sym => {
          const old = next[sym] ?? updates[sym];
          next[sym] = updates[sym];
          // update sparklines
          setSparks(sp => {
            const arr = sp[sym] ? [...sp[sym]] : [];
            arr.push(updates[sym]);
            if (arr.length > 20) arr.shift();
            return { ...sp, [sym]: arr };
          });
          prevPrices.current[sym] = old;
        });
        return next;
      });
    });

    return () => {
      socket.off("prices");
      socket.off("subs");
      socket.disconnect();
    };
  }, [email]);

  function toggle(symbol, shouldSub) {
    socket.emit("toggle-sub", { email, stock: symbol, subscribe: shouldSub });
    setSubs(prev => {
      const copy = new Set(prev);
      if (shouldSub) copy.add(symbol);
      else copy.delete(symbol);
      return copy;
    });
  }

  function logout() {
    localStorage.removeItem("email");
    socket.disconnect();
    onLogout();
  }

  return (
    <div className="dashboard-wrap">
      <header className="dash-header">
        <div>
          <h2>Welcome, <span className="accent">{email.split("@")[0]}</span></h2>
          <p className="muted">Choose stocks to subscribe. Prices update every second.</p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="stocks-grid">
        {supported.map((sym, index) => {
          const cur = prices[sym] ?? 0;
          const prev = prevPrices.current[sym] ?? cur;
          const delta = cur - prev;
          const spark = sparks[sym] || [cur];
          return (
  <div
    key={sym}
    style={{
      animation: "fadeUp 0.5s ease forwards",
      animationDelay: `${index * 250}ms`,
      opacity: 0
    }}
  >
    <StockCard
      symbol={sym}
      price={cur}
      delta={delta}
      spark={spark}
      isSubscribed={subs.has(sym)}
      onToggle={toggle}
    />
  </div>
);
        })}
      </main>

      <footer className="dash-footer">
        <small>Supported: GOOG · TSLA · AMZN · META · NVDA</small>
      </footer>
    </div>
  );
}
