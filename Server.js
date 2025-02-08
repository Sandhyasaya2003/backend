const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB(retries = 5) {
  while (retries) {
    try {
      await client.connect();
      console.log("Connected to MongoDB!");
      break;
    } catch (err) {
      if (err.code === "EREFUSED") {
        console.error(
          "DNS query failed. Please check your network connection and DNS settings."
        );
      }
      console.error("Failed to connect to MongoDB:", err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      if (retries === 0) {
        console.error("Could not connect to MongoDB after multiple attempts.");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 5000)); // wait 5 seconds before retrying
    }
  }
}
connectDB();

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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
