const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e8
});

app.use(express.static("public"));

const users = {}; // username -> socket.id

io.on("connection", socket => {

  socket.on("join", ({ name }) => {
    users[name] = socket.id;
    io.emit("users-list", Object.keys(users));
  });

  // TEXT
  socket.on("private-msg", d => {
    users[d.to] && io.to(users[d.to]).emit("private-msg", d);
  });

  // IMAGE
  socket.on("private-image", d => {
    users[d.to] && io.to(users[d.to]).emit("private-image", d);
  });

  // VOICE MESSAGE
  socket.on("private-voice", d => {
    users[d.to] && io.to(users[d.to]).emit("private-voice", d);
  });

  // VOICE CALL SIGNALING
  socket.on("call-offer", d => {
    users[d.to] && io.to(users[d.to]).emit("call-offer", d);
  });
  socket.on("call-answer", d => {
    users[d.to] && io.to(users[d.to]).emit("call-answer", d);
  });
  socket.on("call-ice", d => {
    users[d.to] && io.to(users[d.to]).emit("call-ice", d);
  });

  // TYPING
  socket.on("typing", d => {
    users[d.to] && io.to(users[d.to]).emit("typing", d.from);
  });

  socket.on("disconnect", () => {
    for (let u in users) {
      if (users[u] === socket.id) delete users[u];
    }
    io.emit("users-list", Object.keys(users));
  });
});

server.listen(process.env.PORT || 3000);
