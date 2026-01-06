const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ================= MongoDB =================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ================= Schemas =================
const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  type: { type: String, default: "text" }, // text | audio
  time: String
});

const Message = mongoose.model("Message", messageSchema);

// ================= Online Users (Memory) =================
let onlineUsers = [];

// ================= Socket Logic =================
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // -------- JOIN --------
  socket.on("join", (name) => {
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);

    onlineUsers.push({
      socketId: socket.id,
      name
    });

    io.emit("onlineUsers", onlineUsers);
  });

  // -------- TEXT MESSAGE --------
  socket.on("sendMessage", async (data) => {
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const msg = new Message({
      name: data.name,
      message: data.message,
      type: "text",
      time
    });

    await msg.save();

    io.emit("receiveMessage", msg);
  });

  // -------- VOICE MESSAGE --------
  socket.on("sendVoice", async (data) => {
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const msg = new Message({
      name: data.name,
      message: data.audio, // base64 audio
      type: "audio",
      time
    });

    await msg.save();

    io.emit("receiveMessage", msg);
  });

  // ================= VOICE CALL (WebRTC) =================

  // call start
  socket.on("callUser", (data) => {
    io.to(data.to).emit("incomingCall", {
      from: socket.id,
      name: data.name
    });
  });

  // call accepted
  socket.on("acceptCall", (data) => {
    io.to(data.to).emit("callAccepted", {
      from: socket.id
    });
  });

  // WebRTC signaling
  socket.on("webrtcOffer", (data) => {
    io.to(data.to).emit("webrtcOffer", data);
  });

  socket.on("webrtcAnswer", (data) => {
    io.to(data.to).emit("webrtcAnswer", data);
  });

  socket.on("webrtcIce", (data) => {
    io.to(data.to).emit("webrtcIce", data);
  });

  // call end
  socket.on("endCall", (data) => {
    io.to(data.to).emit("callEnded");
  });

  // -------- DISCONNECT --------
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);

    onlineUsers = onlineUsers.filter(
      user => user.socketId !== socket.id
    );

    io.emit("onlineUsers", onlineUsers);
  });
});

// ================= Server Start =================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
