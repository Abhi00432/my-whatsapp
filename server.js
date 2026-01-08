const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};     // name -> Set(socket.id)
let online = {};   // name -> true/false
let status = {};   // name -> image(base64)

io.on("connection", socket => {

  // ===== JOIN =====
  socket.on("join", name => {
    if (!name) return;

    if (!users[name]) users[name] = new Set();
    users[name].add(socket.id);
    online[name] = true;

    io.emit("users", Object.keys(users));
    io.emit("online", online);
    io.emit("status", status);
  });

  // ===== TEXT MESSAGE =====
  socket.on("private-msg", data => {
    const sockets = users[data.to];
    if (sockets) {
      sockets.forEach(id => {
        io.to(id).emit("private-msg", data);
      });
    }
  });

  // ===== VOICE MESSAGE =====
  socket.on("voice", data => {
    const sockets = users[data.to];
    if (sockets) {
      sockets.forEach(id => {
        io.to(id).emit("voice", data);
      });
    }
  });

  // ===== SEEN =====
  socket.on("seen", to => {
    const sockets = users[to];
    if (sockets) {
      sockets.forEach(id => {
        io.to(id).emit("seen");
      });
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
      if (users[name].has(socket.id)) {
        users[name].delete(socket.id);

        // अगर उस user का कोई socket नहीं बचा
        if (users[name].size === 0) {
          delete users[name];
          online[name] = false;
        }
        break;
      }
    }

    io.emit("users", Object.keys(users));
    io.emit("online", online);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
