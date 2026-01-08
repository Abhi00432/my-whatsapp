const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};      // name -> socket.id
let status = {};     // name -> image(base64)

io.on("connection", socket => {

  socket.on("join", name => {
    users[name] = socket.id;
    io.emit("users", Object.keys(users));
    io.emit("status", status);
  });

  socket.on("private-msg", data => {
    const toSocket = users[data.to];
    if (toSocket) io.to(toSocket).emit("private-msg", data);
  });

  socket.on("voice", data => {
    const toSocket = users[data.to];
    if (toSocket) io.to(toSocket).emit("voice", data);
  });

  socket.on("add-status", data => {
    status[data.name] = data.image;
    io.emit("status", status);
  });

  socket.on("disconnect", () => {
    for (let n in users) {
      if (users[n] === socket.id) {
        delete users[n];
        break;
      }
    }
    io.emit("users", Object.keys(users));
  });
});

server.listen(3000, () => console.log("Server running"));
