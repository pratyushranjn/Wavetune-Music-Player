const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (req.flash) {
    req.flash('error', err.message || 'Internal Server Error');

    // Redirect back to the last page, or home as fallback
    return res.redirect(req.get('Referrer') || '/');
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  req.session.redirectUrl = req.originalUrl;
  req.flash("error", "You must be logged in first!");
  res.redirect("/login");
};

module.exports = {
  errorHandler,
  isLoggedIn,
};
