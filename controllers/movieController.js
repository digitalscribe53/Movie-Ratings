const { Movie, Rating } = require('../models');
const { Op } = require('sequelize');

const movieController = {
  // Get details of a specific movie
  getMovieDetails: async (req, res) => {
    try {
        const movieId = req.params.id;
        const movie = await Movie.findByPk(movieId);

        if (!movie) {
            return res.status(404).render('error', { message: 'Movie not found' });
        }

        // Get ratings separately
        const ratings = await Rating.findAll({
            where: { movieId: movie.id }
        });

        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        const movieData = movie.get({ plain: true });

        res.render('movieDetails', {
            movie: {
                ...movieData,
                averageRating: avgRating.toFixed(1)
            },
            loggedIn: req.session.loggedIn,
            pageTitle: movieData.title
        });
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).render('error', { message: 'Error fetching movie details' });
    }
},

  // Add a new movie
  addMovie: async (req, res) => {
    try {
      // TODO: Add authentication middleware
      // if (!req.user.isAdmin) return res.status(403).send('Unauthorized');

      const { title, description, imageSrc } = req.body;
      const newMovie = await Movie.create({ title, description, imageSrc });
      res.status(201).json(newMovie);
    } catch (error) {
      console.error('Error adding new movie:', error);
      res.status(500).json({ message: 'Error adding new movie' });
    }
  },

  // Update movie information
  updateMovie: async (req, res) => {
    try {
      // TODO: Add authentication middleware
      // if (!req.user.isAdmin) return res.status(403).send('Unauthorized');

      const movieId = req.params.id;
      const { title, description, imageSrc } = req.body;
      const [updated] = await Movie.update(
        { title, description, imageSrc },
        { where: { id: movieId } }
      );
      if (updated) {
        const updatedMovie = await Movie.findByPk(movieId);
        return res.status(200).json(updatedMovie);
      }
      throw new Error('Movie not found');
    } catch (error) {
      console.error('Error updating movie:', error);
      res.status(500).json({ message: 'Error updating movie' });
    }
  },

  // Delete a movie
  deleteMovie: async (req, res) => {
    try {
      // TODO: Add authentication middleware
      // if (!req.user.isAdmin) return res.status(403).send('Unauthorized');

      const movieId = req.params.id;
      const deleted = await Movie.destroy({ where: { id: movieId } });
      if (deleted) {
        return res.status(204).send("Movie deleted");
      }
      throw new Error('Movie not found');
    } catch (error) {
      console.error('Error deleting movie:', error);
      res.status(500).json({ message: 'Error deleting movie' });
    }
  },

  // Rate a movie
  rateMovie: async (req, res) => {
    try {
      // TODO: Add authentication middleware
      // if (!req.user) return res.status(403).send('Unauthorized');

      const { movieId } = req.params;
      const { rating } = req.body;
      const userId = req.user.id; // Assuming you have user info in req.user

      const [ratingRecord, created] = await Rating.findOrCreate({
        where: { movieId, userId },
        defaults: { rating }
      });

      if (!created) {
        ratingRecord.rating = rating;
        await ratingRecord.save();
      }

      res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ message: 'Error submitting rating' });
    }
  }
};

module.exports = movieController;