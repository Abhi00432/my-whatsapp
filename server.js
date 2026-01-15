const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {}; // room -> last user info

io.on("connection", socket => {

  socket.on("join", ({ room, user }) => {
    socket.join(room);

    if (rooms[room]) {
      // purane user ka intro naye ko
      socket.emit("intro", rooms[room]);

      // naye user ka intro purane ko
      socket.to(room).emit("intro", user);
    }

    rooms[room] = user;
  });

  socket.on("typing", data => {
    socket.to(data.room).emit("typing", data.name);
  });

  socket.on("message", data => {
    socket.to(data.room).emit("message", data);
  });

  socket.on("seen", room => {
    socket.to(room).emit("seen");
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("WhatsApp clone running on", PORT);
});
