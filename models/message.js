const mongoose = require("mongoose");

module.exports = mongoose.model("Message", {
  from: String,
  to: String,
  payload: Object,
  time: { type: Date, default: Date.now }
});
