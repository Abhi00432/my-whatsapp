const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", socket => {

  socket.on("join", name => {
    users[socket.id] = name;
    io.emit("users", users);
  });

  socket.on("private-msg", ({ to, msg }) => {
    io.to(to).emit("private-msg", {
      from: socket.id,
      name: users[socket.id],
      msg
    });
  });

  socket.on("typing", to => {
    socket.to(to).emit("typing", users[socket.id]);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", users);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
