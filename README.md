# 🚀 Real-Time Web Application (Live Checkboxes / Location System)

## 📌 Project Overview

This project is a real-time web application that demonstrates how distributed systems handle live updates using WebSockets, Redis, and event-driven architecture.

Users can interact with a shared UI (checkbox grid / live tracking system), and all updates are reflected instantly across connected clients.

The system is designed to simulate **high-scale real-time applications** similar to modern collaborative platforms.

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- Socket.IO (WebSockets)

### Infrastructure
- Redis (state + Pub/Sub)
- Kafka (optional event streaming layer)

### Authentication
- JWT-based Auth (OIDC-style simulation)

---

## ✨ Features Implemented

- ⚡ Real-time updates using WebSockets
- 👥 Multi-user synchronization
- 🔐 JWT-based authentication
- 📦 Redis-based state storage
- 📡 Redis Pub/Sub for multi-instance sync
- 🚦 Custom rate limiting (no external libraries)
- 🧠 Efficient event handling system
- 📊 Scalable architecture design
- 🗺️ Shared interactive UI (checkbox grid / location markers)

---

## ⚙️ How to Run Locally
> [!NOTE]
> Use username as - adarsh  and password as - 1234 For Login 

### 1. Clone the repository
```bash id="clone1"
git clone <your-repo-url>
cd realtime-app
```
2. Install dependencies
```
npm install
```
4. Start Redis
```
Option A (Docker - Recommended)
docker run -d --name redis \
  -p 6379:6379 \
  redis
```
Option B (Manual install)
```
redis-server
```
6. Start the backend server
```
node server/index.js
```
8. Open the application
```
http://localhost:3000
```
🌐 Environment Variables Required

Create a .env file in the root directory:
```
PORT=3000
JWT_SECRET=your_secret_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```
 Redis Setup Instructions

Redis is used for:

Storing checkbox/grid state
Broadcasting updates using Pub/Sub
Coordinating multiple server instances
Redis Commands Used
1. SET / GET → store state
2. HSET / HGET → structured state storage
3. PUBLISH → broadcast updates
4. SUBSCRIBE → listen for updates
Pub/Sub Flow


```
Client A → Server → Redis PUBLISH
                          ↓
           Redis SUBSCRIBE → Server → Client B, C, D
🔐 Authentication Flow (OIDC-style)

```
This project uses a simplified OIDC-like JWT authentication system.

Flow
```
User Login → Server validates → JWT generated → Sent to client
```
Client stores token → Sends with WebSocket connection
Server verifies token before allowing actions
Steps
- User enters credentials (or mock login)
- Server creates JWT token
- Token stored in frontend (localStorage)
- Socket connection includes token
- Server validates token before processing events
```
🔌 WebSocket Flow
Client → Socket.IO → Server
       → Validate user
       → Process event
       → Update Redis state
       → Publish via Redis Pub/Sub
       → Broadcast to all clients
```
Event Types
checkbox:update
location:update
state:sync
🚦 Rate Limiting Logic

Custom rate limiting is implemented without external libraries.

Strategy Used
IP-based tracking
User ID-based tracking
Time window counters
Redis counters with expiry
Example Logic
```
const key = `rate:${userId}`;

const requests = await redis.incr(key);

if (requests === 1) {
  await redis.expire(key, 10);
}

if (requests > 20) {
  throw new Error("Rate limit exceeded");
}
```
Purpose
- Prevent spam clicks
- Avoid socket flooding
- Protect Redis & server load

🧪 Features in Action
- Multiple users toggle checkboxes simultaneously
- Changes reflect instantly across all clients
- Redis keeps global state consistent
- Rate limiter blocks excessive updates
- Auth ensures only valid users interact
#📸 Screenshots
<img width="681" height="464" alt="Screenshot 2026-05-01 at 2 00 00 PM" src="https://github.com/user-attachments/assets/6fb66e00-ce45-4a1c-8e6a-5ee7020eee4f" />
<img width="1557" height="673" alt="Screenshot 2026-05-01 at 2 00 46 PM" src="https://github.com/user-attachments/assets/654ce2c0-f75e-451e-a6cd-aa2e3cbc1960" />



