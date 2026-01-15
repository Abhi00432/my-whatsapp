const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// room -> last user info store
const rooms = {};

io.on("connection", socket => {

  socket.on("join", ({ room, user }) => {
    socket.join(room);

    // agar room me koi pehle se hai
    if (rooms[room]) {
      // naye user ko purane user ka intro bhejo
      socket.emit("intro", rooms[room]);

      // purane user ko naye ka intro bhejo
      socket.to(room).emit("intro", user);
    }

    // room ka latest user store karo
    rooms[room] = user;
  });

  socket.on("message", data => {
    socket.to(data.room).emit("message", data);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("WhatsApp clone running on", PORT);
});
