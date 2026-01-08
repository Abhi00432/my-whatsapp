const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

io.on("connection", socket => {
  console.log("User connected");

  socket.on("join", name => {
    socket.username = name;
    socket.broadcast.emit("status", `${name} joined`);
  });

  socket.on("message", msg => {
    io.emit("message", {
      name: socket.username,
      text: msg
    });
  });

  socket.on("typing", name => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      socket.broadcast.emit("status", `${socket.username} left`);
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
