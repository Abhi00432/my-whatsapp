const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e7 // images / audio allow
});

app.use(express.static("public"));

let users = {}; // socket.id -> user

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // JOIN
  socket.on("join", (user) => {
    users[socket.id] = user;
    socket.broadcast.emit("user-online", user);
  });

  // TEXT MESSAGE
  socket.on("chat", (data) => {
    socket.broadcast.emit("chat", data);
  });

  // IMAGE MESSAGE
  socket.on("image", (data) => {
    socket.broadcast.emit("image", data);
  });

  // VOICE MESSAGE
  socket.on("voice", (data) => {
    socket.broadcast.emit("voice", data);
  });

  // 🔊 VOICE CALL SIGNALING (WebRTC)
  socket.on("call-offer", (data) => {
    socket.broadcast.emit("call-offer", data);
  });

  socket.on("call-answer", (data) => {
    socket.broadcast.emit("call-answer", data);
  });

  socket.on("call-ice", (data) => {
    socket.broadcast.emit("call-ice", data);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    socket.broadcast.emit("user-offline");
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
