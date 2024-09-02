const { Movie } = require('../models');

const adminController = {
  // Render add movie form
  renderAddMovie: (req, res) => {
    res.render('admin/addMovie', {
      layout: 'admin',
      pageTitle: 'Add New Movie'
    });
  },

  // Handle add movie form submission
  addMovie: async (req, res) => {
    try {
      const { title, description, releaseYear, imageSrc } = req.body;
      await Movie.create({ title, description, releaseYear, imageSrc });
      res.redirect('/admin/movies');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Failed to add movie' });
    }
  },

  // List all movies (admin view)
  listMovies: async (req, res) => {
    try {
      const movies = await Movie.findAll();
      res.render('admin/moviesList', {
        layout: 'admin',
        movies,
        pageTitle: 'Movies List'
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Failed to retrieve movies' });
    }
  }
};

module.exports = adminController;