const adminMiddleware = (req, res, next) => {
  if (!req.session.user_id || !req.session.isAdmin) {
    res.redirect('/login');
  } else {
    next();
  }
};

module.exports = adminMiddleware;