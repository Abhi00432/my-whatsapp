const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 10000;

// static files
app.use(express.static(__dirname));

// routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "chat.html"));
});

// socket logic
io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("message", (msg) => {
        socket.broadcast.emit("message", msg);
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
