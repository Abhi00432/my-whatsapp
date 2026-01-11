const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {

  socket.on("join", user => {
    socket.join(user.room);
  });

  socket.on("message", data => {
    socket.to(data.room).emit("message", data);
  });

  socket.on("status", data => {
    socket.to(data.room).emit("status", data);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("WhatsApp SUPER clone running", PORT)
);
