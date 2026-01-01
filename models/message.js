const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: String,
  msg: String,
  time: String
});

module.exports = mongoose.model("Message", messageSchema);
