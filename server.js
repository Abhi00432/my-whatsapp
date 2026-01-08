const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};   // name -> Set(socket.id)
let online = {}; // name -> true/false
let status = {};
let disconnectTimers = {}; // 👈 NEW

io.on("connection", socket => {

  socket.on("join", name => {
    if (!name) return;

    // clear pending disconnect
    if (disconnectTimers[name]) {
      clearTimeout(disconnectTimers[name]);
      delete disconnectTimers[name];
    }

    if (!users[name]) users[name] = new Set();
    users[name].add(socket.id);
    online[name] = true;

    io.emit("users", Object.keys(users));
    io.emit("online", online);
  });

  socket.on("private-msg", data => {
    const set = users[data.to];
    if (set) set.forEach(id => io.to(id).emit("private-msg", data));
  });

  socket.on("voice", data => {
    const set = users[data.to];
    if (set) set.forEach(id => io.to(id).emit("voice", data));
  });

  socket.on("disconnect", () => {
    for (let name in users) {
      if (users[name].has(socket.id)) {
        users[name].delete(socket.id);

        // 👇 DELAY OFFLINE (IMPORTANT)
        disconnectTimers[name] = setTimeout(() => {
          if (!users[name] || users[name].size === 0) {
            delete users[name];
            online[name] = false;
            io.emit("users", Object.keys(users));
            io.emit("online", online);
          }
        }, 3000); // 3 seconds grace time

        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server running");
});
