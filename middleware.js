const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  if (!req.session.redirectUrl) {
    req.flash("error", "You must be logged in first!");
  }

  req.session.redirectUrl = req.originalUrl;
  res.redirect("/login");
};


module.exports = { isLoggedIn };