# CUPI Stock Broker Client Web Dashboard

Name: Sparsha Vijay

## Project Overview
This project is developed as part of the CUPI Campus Drive assignment.

It is a stock broker client web dashboard that allows users to:
- Log in using email
- Subscribe to supported stocks
- View live-updating stock prices without refreshing the page

Stock prices are simulated using a random generator and update every second.
The application supports multiple users with real-time updates using WebSockets.

## Tech Stack
Frontend: React, Vite, Socket.IO Client  
Backend: Node.js, Express, Socket.IO  

## Supported Stocks
GOOG, TSLA, AMZN, META, NVDA

## Folder Structure
client/  -> Frontend code  
server/  -> Backend code  

## How to Run Locally

### Backend
```
cd server
npm install
npm start
```

### Frontend
```
cd client
npm install
npm run dev
```

## Notes
- Backend runs on port 5000
- Frontend runs on port 5173
- Application runs on localhost
