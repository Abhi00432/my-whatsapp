const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e7
});

app.use(express.static("public"));

/*
  users = {
    username: socket.id
  }
*/
const users = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // JOIN
  socket.on("join", ({ name }) => {
    users[name] = socket.id;
    io.emit("users-list", Object.keys(users));
  });

  // PRIVATE TEXT
  socket.on("private-msg", ({ to, from, msg }) => {
    if (users[to]) {
      io.to(users[to]).emit("private-msg", { from, msg });
    }
  });

  // PRIVATE IMAGE
  socket.on("private-image", ({ to, from, img }) => {
    if (users[to]) {
      io.to(users[to]).emit("private-image", { from, img });
    }
  });

  // PRIVATE VOICE
  socket.on("private-voice", ({ to, from, audio }) => {
    if (users[to]) {
      io.to(users[to]).emit("private-voice", { from, audio });
    }
  });

  // TYPING (ONLY EVENT, NO DOM)
  socket.on("typing", ({ to, from }) => {
    if (users[to]) {
      io.to(users[to]).emit("typing", from);
    }
  });

  socket.on("disconnect", () => {
    for (let name in users) {
      if (users[name] === socket.id) {
        delete users[name];
        break;
      }
    }
    io.emit("users-list", Object.keys(users));
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
