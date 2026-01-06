const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* MongoDB */
mongoose.connect(process.env.MONGO_URL)
  .then(()=>console.log("MongoDB connected"))
  .catch(e=>console.log(e));

/* User model (deviceId UNIQUE) */
const User = mongoose.model("User", {
  deviceId: { type: String, unique: true },
  name: String,
  dp: String,
  socketId: String
});

/* Multer */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (r, f, cb) =>
    cb(null, Date.now() + path.extname(f.originalname))
});
const upload = multer({ storage });

/* Pages */
app.get("/", (req, res) => res.sendFile(__dirname + "/join.html"));
app.get("/chat", (req, res) => res.sendFile(__dirname + "/chat.html"));

/* JOIN = CREATE OR UPDATE (NO DUPLICATE EVER) */
app.post("/join", upload.single("dp"), async (req, res) => {
  const { name, deviceId } = req.body;

  let user = await User.findOne({ deviceId });

  if (user) {
    user.name = name;
    if (req.file) user.dp = "/uploads/" + req.file.filename;
    await user.save();
  } else {
    user = await User.create({
      deviceId,
      name,
      dp: "/uploads/" + req.file.filename
    });
  }

  res.json(user);
});

/* USERS */
app.get("/users", async (req, res) => {
  res.json(await User.find());
});

/* SOCKET */
io.on("connection", socket => {
  socket.on("register", async userId => {
    await User.findByIdAndUpdate(userId, { socketId: socket.id });
  });

  socket.on("msg", async data => {
    const toUser = await User.findById(data.to);
    if (toUser?.socketId) {
      io.to(toUser.socketId).emit("msg", data);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
