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
    if (username === password) {
      const error = new Error('Username cannot be the same as the password');
      error.status = 400;
      return next(error); // Passing the error to the error handling middleware
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email already exists!');
      return res.redirect('/signup'); // Redirect back to the signup page
    }

    // Register new user
    const registeredUser = await User.register(newUser, password);
    req.logIn(registeredUser, (err) => {
      if (err) return next(err);
      return res.redirect("/"); // Redirect to the homepage after successful signup
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
});


// Login Route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(new Error("Error during authentication: " + err.message));
    }

  if (!user) {
      req.flash('error', info?.message || "Password or email is incorrect");
      return res.redirect('/login');
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(new Error("Login failed: " + err.message));
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
  const messages = req.flash("error");
  res.render("login", { messages });
});


// Signup Page
router.get("/signup", (req, res) => {
  const messages = req.flash("error");
  res.render("signup", { messages });
});


// Update User details
router.post('/update-user/:id', async (req, res, next) => {
  const { name, email, password } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    if (name === password) {
      const error = new Error('Username password cannot be the same');
      error.status = 400;
      return next(error);
    }

    user.username = name;
    user.email = email;

    if (password && password.trim() !== '') {
      await user.setPassword(password);
    }

    await user.save();

    req.logIn(user, (err) => {
      if (err) {
        console.error('Re-authentication error after update:', err);
        return next(err);
      }
      return res.redirect('/');
    });

  } catch (err) {
    next(err);
  }
});

// Delete User
router.delete("/delete-user", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      await User.findByIdAndDelete(req.user._id);
      req.logout((err) => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });
        res.json({ success: true, message: "Account deleted" });
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ success: false, message: "Error deleting user." });
    }
  } else {
    res.status(403).json({ success: false, message: "Unauthorized" });
  }
});

// router.get("/fail", (req, res, next) => {
//   next(new Error("This is a test error."));
//   console.log(ok);
// });


module.exports = router;
