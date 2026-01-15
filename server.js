const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {

  socket.on("join", room => {
    socket.join(room);
    console.log("joined room:", room);
  });

  socket.on("intro", user => {
    socket.to(user.room).emit("intro", user);
  });

  socket.on("message", data => {
    socket.to(data.room).emit("message", data);
  });

  socket.on("typing", data => {
    socket.to(data.room).emit("typing", data.name);
  });

  socket.on("seen", room => {
    socket.to(room).emit("seen");
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("WhatsApp clone running on", PORT)
);
