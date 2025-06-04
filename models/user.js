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

// Tells passport-local-mongoose to use `email` for login
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    IncorrectPasswordError: 'Password is incorrect',
    IncorrectUsernameError: 'Email is not registered',
    MissingUsernameError: 'Email is required',
    MissingPasswordError: 'Password is required',
  }
});



module.exports = mongoose.model("User", userSchema);