const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {}; // username -> socket.id

io.on("connection", socket => {

  socket.on("join", name => {
    if (!name) return;
    users[name] = socket.id;
    io.emit("users", Object.keys(users));
  });

  socket.on("private-msg", ({ to, from, msg }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("private-msg", { from, msg });
    }
  });

  socket.on("typing", to => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("typing");
    }
  });

  socket.on("disconnect", () => {
    for (let name in users) {
      if (users[name] === socket.id) {
        delete users[name];
        break;
      }
    }
    io.emit("users", Object.keys(users));
  });
});

server.listen(3000, () => {
  console.log("Server running");
});
