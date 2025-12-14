// backend/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // allow frontend dev origin
});

const SUPPORTED = ["GOOG","TSLA","AMZN","META","NVDA"];

// current prices
const stockPrices = {};
SUPPORTED.forEach(s => stockPrices[s] = +(100 + Math.random() * 200).toFixed(2));

// subscriptions: email -> Set of stocks
const subscriptions = {}; // { email: Set([...]) }

function ensureSub(email) {
  if (!subscriptions[email]) subscriptions[email] = new Set();
}

// REST route to fetch supported stocks and current prices
app.get("/api/stocks", (req, res) => {
  res.json({ supported: SUPPORTED, prices: stockPrices });
});

io.on("connection", socket => {
  console.log("Socket connected:", socket.id);

  socket.on("identify", ({ email }) => {
    if (!email) return;
    socket.data.email = email;
    socket.join(email); // room for this email
    ensureSub(email);
    console.log(`Socket ${socket.id} identified as ${email}`);

    // send current prices for subscribed stocks
    const subs = Array.from(subscriptions[email] || []);
    const payload = {};
    subs.forEach(s => payload[s] = stockPrices[s]);
    socket.emit("prices", payload);
  });

  // toggle subscription
  socket.on("toggle-sub", ({ email, stock, subscribe }) => {
    if (!email || !stock) return;
    ensureSub(email);
    if (subscribe) subscriptions[email].add(stock);
    else subscriptions[email].delete(stock);
    // immediate send of the toggled stock price
    socket.emit("prices", { [stock]: stockPrices[stock] });
    console.log(`${email} ${subscribe ? "subscribed to" : "unsubscribed from"} ${stock}`);
  });

  socket.on("get-subs", ({ email }) => {
    socket.emit("subs", Array.from(subscriptions[email] || []));
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// update prices every second and emit to subscribers
setInterval(() => {
  SUPPORTED.forEach(s => {
    const pct = (Math.random() - 0.5) * 0.03; // +/- up to ~1.5%
    stockPrices[s] = +(stockPrices[s] * (1 + pct)).toFixed(2);
  });

  Object.keys(subscriptions).forEach(email => {
    const subs = Array.from(subscriptions[email]);
    if (subs.length === 0) return;
    const payload = {};
    subs.forEach(s => payload[s] = stockPrices[s]);
    io.to(email).emit("prices", payload);
  });
}, 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
