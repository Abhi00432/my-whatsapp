const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 10000;

// static files (IMPORTANT)
app.use(express.static(path.join(__dirname)));

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// CHAT
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

// SOCKET
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
