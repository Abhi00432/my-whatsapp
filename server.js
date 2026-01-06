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

/* ensure uploads folder */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

/* MongoDB */
mongoose.connect(process.env.MONGO_URL)
  .then(()=>console.log("MongoDB connected"))
  .catch(e=>{ console.error(e); process.exit(1); });

/* User model */
const User = mongoose.model("User", {
  deviceId: String,
  name: String,
  dp: String,
  socketId: String,
  online: { type: Boolean, default: false }
});

/* Multer */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req,file,cb)=>
    cb(null, Date.now()+path.extname(file.originalname))
});
const upload = multer({ storage });

/* Pages */
app.get("/", (req,res)=>res.sendFile(__dirname+"/join.html"));
app.get("/chat", (req,res)=>res.sendFile(__dirname+"/chat.html"));

/* Join */
app.post("/join", upload.single("dp"), async (req,res)=>{
  const { name, deviceId } = req.body;
  let user = await User.findOne({ deviceId });

  const dpPath = req.file
    ? "/uploads/"+req.file.filename
    : "/uploads/default.png";

  if(user){
    user.name = name;
    user.dp = dpPath;
    await user.save();
  }else{
    user = await User.create({ deviceId, name, dp: dpPath });
  }
  res.json(user);
});

/* Users */
app.get("/users", async (req,res)=>{
  res.json(await User.find());
});

/* Voice upload */
app.post("/voice", upload.single("audio"), (req,res)=>{
  res.json({ url: "/uploads/"+req.file.filename });
});

/* Socket */
io.on("connection", socket => {

  socket.on("register", async userId=>{
    socket.userId = userId;
    await User.findByIdAndUpdate(userId,{ socketId:socket.id, online:true });
    io.emit("presence",{ userId, online:true });
  });

  socket.on("msg", async d=>{
    const u = await User.findById(d.to);
    if(u?.socketId) io.to(u.socketId).emit("msg", d);
  });

  socket.on("voice", async d=>{
    const u = await User.findById(d.to);
    if(u?.socketId) io.to(u.socketId).emit("voice", d);
  });

  socket.on("typing", d=>{
    io.to(d.to).emit("typing",{ from:d.from });
  });

  socket.on("stopTyping", d=>{
    io.to(d.to).emit("stopTyping",{ from:d.from });
  });

  /* CALL signaling */
  socket.on("call-offer", d=>io.to(d.to).emit("call-offer", d));
  socket.on("call-answer", d=>io.to(d.to).emit("call-answer", d));
  socket.on("call-ice", d=>io.to(d.to).emit("call-ice", d));
  socket.on("call-end", d=>io.to(d.to).emit("call-end", d));

  socket.on("disconnect", async ()=>{
    if(socket.userId){
      await User.findByIdAndUpdate(socket.userId,{ online:false });
      io.emit("presence",{ userId:socket.userId, online:false });
    }
  });
});

/* PORT */
const PORT = process.env.PORT || 3000;
server.listen(PORT,"0.0.0.0",()=>console.log("Server running",PORT));
