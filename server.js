const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ensure uploads folder exists (Render safety) */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* MongoDB */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });

/* Model */
const User = mongoose.model("User", {
  deviceId: String,
  name: String,
  dp: String,
  socketId: String
});

/* Multer */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* Pages */
app.get("/", (req, res) => res.sendFile(__dirname + "/join.html"));
app.get("/chat", (req, res) => res.sendFile(__dirname + "/chat.html"));

/* Join (CRASH SAFE) */
app.post("/join", upload.single("dp"), async (req, res) => {
  try {
    const { name, deviceId } = req.body;

    if (!name || !deviceId) {
      return res.status(400).json({ error: "Missing data" });
    }

    let user = await User.findOne({ deviceId });

    const dpPath = req.file
      ? "/uploads/" + req.file.filename
      : "/uploads/default.png";

    if (user) {
      user.name = name;
      user.dp = dpPath;
      await user.save();
    } else {
      user = await User.create({
        deviceId,
        name,
        dp: dpPath
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ error: "Join failed" });
  }
});

/* Users */
app.get("/users", async (req, res) => {
  res.json(await User.find());
});

/* Socket */
io.on("connection", socket => {
  socket.on("register", async id => {
    await User.findByIdAndUpdate(id, { socketId: socket.id });
  });

  socket.on("msg", async data => {
    const toUser = await User.findById(data.to);
    if (toUser?.socketId) {
      io.to(toUser.socketId).emit("msg", data);
    }
  });
});

/* PORT (Render requirement) */
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
