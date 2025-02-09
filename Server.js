const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

//npm install mongodb@2.2.12

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

var MongoClient = require("mongodb").MongoClient;

const username = encodeURIComponent("sakthi1");
const password = encodeURIComponent("0Gt04P5rejD9zKGz");
const uri = `mongodb://${username}:${password}@cluster0-shard-00-00.f2fsw.mongodb.net:27017,cluster0-shard-00-01.f2fsw.mongodb.net:27017,cluster0-shard-00-02.f2fsw.mongodb.net:27017/?ssl=true&replicaSet=atlas-iek3b5-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

MongoClient.connect(uri, function (err, client) {
  if (err) {
    console.error("Failed to connect to MongoDB:", err);
    return;
  }
  console.log("Connected to MongoDB!");
  // perform actions on the collection object
  client.close();
});

const {
  initializeMongoClient,
  addUser,
  findUserByUsername,
  addEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} = require("./eventController");

initializeMongoClient("sakthi1", "0Gt04P5rejD9zKGz");

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await addUser({ username, password: hashedPassword });
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(500).send(`Error creating user ${err}`);
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ token });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    res.status(500).send("Error logging in");
  }
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Add event route
app.post("/events", authenticateToken, async (req, res) => {
  try {
    await addEvent(req.body);
    res.status(201).send("Event added successfully");
  } catch (err) {
    res.status(500).send("Error adding event");
  }
});

// List events route
app.get("/events", authenticateToken, async (req, res) => {
  try {
    const events = await getEvents();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).send("Error fetching events");
  }
});

// Update event route
app.put("/events/:id", authenticateToken, async (req, res) => {
  try {
    await updateEvent(req.params.id, req.body);
    res.status(200).send("Event updated successfully");
  } catch (err) {
    res.status(500).send("Error updating event");
  }
});

// Delete event route
app.delete("/events/:id", authenticateToken, async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.status(200).send("Event deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting event");
  }
});

// Define your routes here
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Setting up HTTP server and Socket.io
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// API Endpoints for Postman
/*
POST /signup
  - Body: { "username": "your-username", "password": "your-password" }

POST /login
  - Body: { "username": "your-username", "password": "your-password" }

POST /events
  - Headers: { "Authorization": "Bearer <token>" }
  - Body: { "name": "event-name", "date": "event-date" }

GET /events
  - Headers: { "Authorization": "Bearer <token>" }

PUT /events/:id
  - Headers: { "Authorization": "Bearer <token>" }
  - Body: { "name": "updated-event-name", "date": "updated-event-date" }

DELETE /events/:id
  - Headers: { "Authorization": "Bearer <token>" }
*/
