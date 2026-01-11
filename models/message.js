const mongoose = require("mongoose");

module.exports = mongoose.model("Message", {
  text: String,
  time: { type: Date, default: Date.now }
});
