import React from "react";

function Sparkline({ points = [] }) {
  if (points.length < 2) return <svg width="100" height="30"></svg>;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 120, h = 40;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * h;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function StockCard({ symbol, price, delta, spark, isSubscribed, onToggle }) {
  const up = delta >= 0;
  return (
    <div className={`stock-card ${isSubscribed ? "subbed" : ""}`}>
      <div className="stock-top">
        <div className="symbol">{symbol}</div>
        <label className="switch">
          <input type="checkbox" checked={isSubscribed} onChange={(e)=>onToggle(symbol, e.target.checked)} />
          <span className="slider"></span>
        </label>
      </div>

      <div className="price-row">
        <div className="price">₹ {price?.toFixed(2)}</div>
        <div className={`delta ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}</div>
      </div>

      <div className="sparkline-wrap">
        <Sparkline points={spark} />
      </div>
    </div>
  );
}
