const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/message");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1/whatsapp");

io.on("connection", socket => {
  socket.on("private-message", async data => {
    await Message.create(data);
    socket.broadcast.emit("private-message", data);
  });
});

server.listen(3000, () =>
  console.log("WhatsApp clone running on 3000")
);
