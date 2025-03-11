const express = require('express');
const passport = require('passport');
const User = require("../models/user");
const { isLoggedIn } = require('../middleware');
const router = express.Router();

// Register User
router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;
  const newUser = new User({ email, username });

  try {
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.logIn(registeredUser, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });

  } catch (err) {
    console.log("Signup Error:", err);
    req.flash("error", err.message);
    res.redirect("/signup");
  }
});

// Login Route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log("Authentication Error:", err);
      req.flash("error", "error during authentication.");
      return next(err);
    }

    if (!user) {
      console.log("Authentication Failed:", info);
      req.flash("error", info.message || "Authentication failed. Please check your credentials.");
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.log("Login Error:", err);
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/login");
      }

      req.session.loginTime = new Date();
      const redirectUrl = req.session.redirectUrl || "/";
      delete req.session.redirectUrl;
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
});


// Logout Route 
router.post("/logout", (req, res, next) => {

  req.logout((err) => {
    if (err) {
      console.log("Logout Error:", err);
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        console.log("Session Destroy Error:", err);
        return res.redirect("/");
      }
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
});


// Protected Main Route
router.get("/", isLoggedIn, (req, res) => {
  res.render("index", { user: req.user });
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { messages: req.flash("error") });
});

// Signup Page
router.get("/signup", (req, res) => {
  res.render("signup");
});

module.exports = router;
