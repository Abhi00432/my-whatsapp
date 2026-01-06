const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// static files
app.use(express.static(path.join(__dirname, "public")));

// root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// users memory
// socketId : { name, dp }
let users = {};

io.on("connection", (socket) => {
  console.log("🟢 connected:", socket.id);

  // join with dp
  socket.on("join", (data) => {
    users[socket.id] = {
      name: data.name,
      dp: data.dp // base64 image
    };
    io.emit("online-users", users);
  });

  // private message
  socket.on("private-message", (data) => {
    io.to(data.to).emit("receive-message", {
      from: socket.id,
      name: users[socket.id].name,
      msg: data.msg
    });
  });

  // typing
  socket.on("typing", (to) => {
    io.to(to).emit("typing", users[socket.id].name);
  });

  socket.on("stopTyping", (to) => {
    io.to(to).emit("stopTyping");
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("online-users", users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
