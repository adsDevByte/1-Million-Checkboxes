const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Redis = require("ioredis");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

const SECRET = "supersecretkey";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: "mypassword"
});

const pub = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: "mypassword"
});

const sub = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: "mypassword"
});

// In-memory stores
const authCodes = new Map();

// Mock user
const users = [
  {
    id: "1",
    username: "adarsh",
    password: bcrypt.hashSync("1234", 8)
  }
];




app.get("/authorize", (req, res) => {
  const { username, password } = req.query;

  const user = users.find(u => u.username === username);
  if (!user) return res.send("Invalid user");

  if (!bcrypt.compareSync(password, user.password)) {
    return res.send("Invalid password");
  }


  const code = crypto.randomBytes(16).toString("hex");

  authCodes.set(code, user);


  res.redirect(`/?code=${code}`);
});


app.post("/token", (req, res) => {
  const { code } = req.body;

  const user = authCodes.get(code);
  if (!user) return res.status(400).json({ error: "Invalid code" });

  authCodes.delete(code);

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({ access_token: token });
});

// 3. USERINFO
app.get("/userinfo", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send("No token");

  const token = auth.split(" ")[1];

  try {
    const user = jwt.verify(token, SECRET);
    res.json(user);
  } catch {
    res.status(401).send("Invalid token");
  }
});



const TOTAL_CHECKBOXES = 10000;
let checkboxState = new Array(TOTAL_CHECKBOXES).fill(0);


(async () => {
  const data = await redis.get("checkbox_state");
  if (data) checkboxState = JSON.parse(data);
})();


const rateLimitMap = new Map();
function isRateLimited(userId) {
  const now = Date.now();
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, { count: 1, time: now });
    return false;
  }
  const entry = rateLimitMap.get(userId);

  if (now - entry.time > 1000) {
    entry.count = 1;
    entry.time = now;
    return false;
  }

  entry.count++;
  return entry.count > 10;
}


sub.subscribe("checkbox_updates");
sub.on("message", (_, message) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});


wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const token = url.searchParams.get("token");

  if (!token) return ws.close();

  let user;
  try {
    user = jwt.verify(token, SECRET);
  } catch {
    return ws.close();
  }

  ws.user = user;

  ws.send(JSON.stringify({ type: "init", state: checkboxState }));

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg);

    if (isRateLimited(ws.user.id)) return;

    checkboxState[data.index] = data.value;

    await redis.set("checkbox_state", JSON.stringify(checkboxState));

    pub.publish("checkbox_updates", JSON.stringify(data));
  });
});

server.listen(3000, () => console.log("OIDC Server running on 3000"));