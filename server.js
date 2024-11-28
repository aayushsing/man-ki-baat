const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

// Load environment variables
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow frontend access
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Models
const User = require("/man ki baat/models/User");
const Message = require("/man ki baat/models/Message");

// Routes
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({ message: "Login successful", userId: user._id });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Real-time Chat with Socket.IO
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join room
    socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    // Handle message
    socket.on("sendMessage", async ({ roomId, sender, message }) => {
        const newMessage = new Message({ roomId, sender, message });
        await newMessage.save();

        io.to(roomId).emit("newMessage", newMessage); // Broadcast to all in the room
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
