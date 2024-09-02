const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
      next();
    } else {
      res.status(403).render('error', { message: 'Access denied. Admin rights required.' });
    }
  };
  
  module.exports = { isAdmin };