const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: Number,
  name: String,
  username: String,
  language: {
    type: String,
    default: "en"
  },
  notification: {
    type: Boolean,
    default: false
  },
  notificationsCity: String,
  state: Object,
  recentCities: [String],
  units: {
    type: String,
    default: 'metric'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
