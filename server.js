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

  // JOIN
  socket.on("join", ({ name }) => {
    users[name] = socket.id;
    io.emit("users-list", Object.keys(users));
  });

  // PRIVATE MESSAGE
  socket.on("private-msg", ({ to, from, msg }) => {
    if (users[to]) {
      io.to(users[to]).emit("private-msg", { from, msg });
    }
  });

  // IMAGE
  socket.on("private-image", ({ to, from, img }) => {
    if (users[to]) {
      io.to(users[to]).emit("private-image", { from, img });
    }
  });

  // VOICE
  socket.on("private-voice", ({ to, from, audio }) => {
    if (users[to]) {
      io.to(users[to]).emit("private-voice", { from, audio });
    }
  });

  // TYPING
  socket.on("typing", ({ to, from }) => {
    if (users[to]) {
      io.to(users[to]).emit("typing", from);
    }
  });

  socket.on("disconnect", () => {
    for (let u in users) {
      if (users[u] === socket.id) {
        delete users[u];
        break;
      }
    }
    io.emit("users-list", Object.keys(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running"));

  typingDiv.innerText = `${u} is typing...`;  setTimeout(() => {
    typingEl.innerText = "";
  }, 2000); 