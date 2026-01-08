const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};        // name -> socket.id
let online = {};      // name -> true

io.on("connection", socket => {

  socket.on("join", name => {
    users[name] = socket.id;
    online[name] = true;
    io.emit("users", online);
  });

  socket.on("private-msg", data => {
    const toSocket = users[data.to];
    if (toSocket) {
      io.to(toSocket).emit("private-msg", data);
    }
  });

  socket.on("seen", to => {
    const toSocket = users[to];
    if (toSocket) io.to(toSocket).emit("seen");
  });

  socket.on("voice", data => {
    const toSocket = users[data.to];
    if (toSocket) io.to(toSocket).emit("voice", data);
  });

  socket.on("disconnect", () => {
    for (let name in users) {
      if (users[name] === socket.id) {
        online[name] = false;
        delete users[name];
        break;
      }
    }
    io.emit("users", online);
  });
});

server.listen(3000, () => console.log("Server running"));
