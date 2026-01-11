const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {
  socket.on("message", msg => {
    socket.broadcast.emit("message", msg);
  });
});

server.listen(3000, () => {
  console.log("WhatsApp clone running on port 3000");
});
