const router = require('express').Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { Movie } = require('../models');

router.use(adminMiddleware);

router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    layout: 'admin'
  });
});

router.get('/add-movie', (req, res) => {
  res.render('admin/addMovie', {
    layout: 'admin'
  });
});

router.post('/add-movie', async (req, res) => {
  try {
    await Movie.create(req.body);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;