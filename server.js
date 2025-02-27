if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("express-flash");
const User = require('./models/user.js');
const path = require("path");
const helmet = require("helmet");

const dbUrl = process.env.ATLAS_URL;
const authRoutes = require('./routes/auth.js');
const songRoutes = require('./routes/music.js');

const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet({ contentSecurityPolicy: false }));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 12 * 3600,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
});

store.on("error", function (err) {
  console.log("Error in Mongo Session Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

// Prevent caching
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Middleware 
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Connect to MongoDB
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

app.use(authRoutes);
app.use(songRoutes);

  const PORT = process.env.PORT || 3000; // Use Vercel-assigned port
  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
