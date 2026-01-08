const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};     // name -> socket.id
let online = {};   // name -> true/false
let status = {};   // name -> image(base64)

io.on("connection", socket => {

  // ===== JOIN =====
  socket.on("join", name => {
    if (!name) return;

    users[name] = socket.id;
    online[name] = true;

    io.emit("users", Object.keys(users));
    io.emit("online", online);
    io.emit("status", status);
  });

  // ===== TEXT MESSAGE =====
  socket.on("private-msg", data => {
    const toSocket = users[data.to];
    if (toSocket) {
      io.to(toSocket).emit("private-msg", data);
    }
  });

  // ===== SEEN =====
  socket.on("seen", to => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("seen");
    }
  });

  // ===== VOICE MESSAGE =====
  socket.on("voice", data => {
    const toSocket = users[data.to];
    if (toSocket) {
      io.to(toSocket).emit("voice", data);
    }
  });

  // ===== STATUS ADD =====
  socket.on("add-status", data => {
    status[data.name] = data.image;
    io.emit("status", status);
  });

  // ===== DISCONNECT =====
  socket.on("disconnect", () => {
    for (let name in users) {
      if (users[name] === socket.id) {
        online[name] = false;
        delete users[name];
        break;
      }
    }
    io.emit("online", online);
    io.emit("users", Object.keys(users));
  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
