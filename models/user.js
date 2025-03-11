const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"]
  },
  favoriteSongs: [
    {
      id: {
        type: String,
        required: true

      },
      thumbnail: {
        type: String,
      },
      name: {
        type: String,
        required: true
      },
      album: {
        type: String,
      },
      audioUrl: {
        type: String,
        required: true
      }
    }
  ],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
