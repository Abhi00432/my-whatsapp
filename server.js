const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e8
});

app.use(express.static("public"));

/*
users = {
  username: {
    socketId,
    dp
  }
}
*/
const users = {};

io.on("connection", socket => {

  // JOIN WITH DP
  socket.on("join", ({ name, dp }) => {
    users[name] = {
      socketId: socket.id,
      dp: dp || ""
    };

    // send users list with dp
    const list = Object.keys(users).map(u => ({
      name: u,
      dp: users[u].dp
    }));

    io.emit("users-list", list);
  });

  // PRIVATE TEXT
  socket.on("private-msg", d => {
    if (users[d.to]) {
      io.to(users[d.to].socketId).emit("private-msg", {
        from: d.from,
        msg: d.msg,
        dp: users[d.from]?.dp || ""
      });
    }
  });

  // PRIVATE IMAGE
  socket.on("private-image", d => {
    if (users[d.to]) {
      io.to(users[d.to].socketId).emit("private-image", {
        from: d.from,
        img: d.img,
        dp: users[d.from]?.dp || ""
      });
    }
  });

  // PRIVATE VOICE
  socket.on("private-voice", d => {
    if (users[d.to]) {
      io.to(users[d.to].socketId).emit("private-voice", {
        from: d.from,
        audio: d.audio,
        dp: users[d.from]?.dp || ""
      });
    }
  });

  socket.on("disconnect", () => {
    for (let u in users) {
      if (users[u].socketId === socket.id) {
        delete users[u];
        break;
      }
    }

    const list = Object.keys(users).map(u => ({
      name: u,
      dp: users[u].dp
    }));

    io.emit("users-list", list);
  });
});

server.listen(process.env.PORT || 3000);
