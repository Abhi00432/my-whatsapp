const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {}; // socket.id -> username

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;

    socket.broadcast.emit("info", `${username} online`);
  });

  socket.on("send-message", (msg) => {
    socket.broadcast.emit("receive-message", {
      user: users[socket.id],
      message: msg,
    });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", users[socket.id]);
  });

  socket.on("stop-typing", () => {
    socket.broadcast.emit("stop-typing", users[socket.id]);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("info", `${users[socket.id]} offline`);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log("✅ Server running on port " + PORT);
});
