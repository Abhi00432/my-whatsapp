const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/*
 users = {
   name: {
     sockets: Set(),
     online: true
   }
 }
*/
const users = {};

io.on("connection", socket => {

  socket.on("join", name => {
    if (!name) return;

    if (!users[name]) {
      users[name] = {
        sockets: new Set(),
        online: true
      };
    }

    users[name].sockets.add(socket.id);
    users[name].online = true;

    emitUsers();
  });

  socket.on("private-msg", data => {
    const user = users[data.to];
    if (!user) return;

    user.sockets.forEach(id => {
      io.to(id).emit("private-msg", data);
    });
  });

  socket.on("typing", to => {
    const user = users[to];
    if (!user) return;

    user.sockets.forEach(id => {
      io.to(id).emit("typing");
    });
  });

  socket.on("disconnect", () => {
    for (const name in users) {
      const u = users[name];

      if (u.sockets.has(socket.id)) {
        u.sockets.delete(socket.id);

        // ❗ user offline only if NO socket left
        if (u.sockets.size === 0) {
          u.online = false;
        }

        emitUsers();
        break;
      }
    }
  });

  function emitUsers() {
    const list = Object.keys(users).filter(n => users[n].online);
    io.emit("users", list);
  }
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
