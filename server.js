const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// ===== static files =====
app.use(express.static(path.join(__dirname, "public")));

// ===== root =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// ===== online users =====
let users = [];

// ===== socket =====
io.on("connection", (socket) => {
  console.log("🟢 connected:", socket.id);

  socket.on("join", (name) => {
    users = users.filter(u => u.id !== socket.id);
    users.push({ id: socket.id, name });
    io.emit("online-users", users);
  });

  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("send-message", (data) => {
    io.emit("receive-message", data);
  });

  socket.on("send-voice", (data) => {
    io.emit("receive-voice", data);
  });

  // ===== voice call signaling =====
  socket.on("call-user", data => {
    io.to(data.to).emit("incoming-call", {
      from: socket.id,
      name: data.name
    });
  });

  socket.on("accept-call", data => {
    io.to(data.to).emit("call-accepted", data);
  });

  socket.on("ice-candidate", data => {
    io.to(data.to).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    users = users.filter(u => u.id !== socket.id);
    io.emit("online-users", users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
