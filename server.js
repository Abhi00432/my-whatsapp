const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};      // name -> socket.id
let online = {};    // name -> true/false
let lastSeen = {};  // name -> time
let dp = {};        // name -> base64
let status = {};    // name -> base64

io.on("connection", socket => {

  socket.on("join", name => {
    users[name] = socket.id;
    online[name] = true;
    io.emit("presence", { online, lastSeen, dp });
  });

  socket.on("private-msg", data => {
    const toSocket = users[data.to];
    if (toSocket) io.to(toSocket).emit("private-msg", data);
  });

  socket.on("seen", to => {
    const toSocket = users[to];
    if (toSocket) io.to(toSocket).emit("seen");
  });

  socket.on("voice", data => {
    const toSocket = users[data.to];
    if (toSocket) io.to(toSocket).emit("voice", data);
  });

  socket.on("dp", data => {
    dp[data.name] = data.image;
    io.emit("presence", { online, lastSeen, dp });
  });

  socket.on("status", data => {
    status[data.name] = data.image;
    io.emit("status", status);
  });

  socket.on("disconnect", () => {
    for (let name in users) {
      if (users[name] === socket.id) {
        online[name] = false;
        lastSeen[name] = new Date().toLocaleTimeString();
        delete users[name];
        break;
      }
    }
    io.emit("presence", { online, lastSeen, dp });
  });
});

server.listen(3000, () => console.log("Server running"));
