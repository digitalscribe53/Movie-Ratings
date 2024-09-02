const { Movie } = require('../models');

const homeController = {
  // Get all movies for the home page
  getHomePage: async (req, res) => {
    try {
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = 12; // Number of movies per page
      const offset = (page - 1) * limit;

      // Fetch movies from the database
      const { count, rows: movies } = await Movie.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']], // Sort by newest first
      });

      // Calculate total pages
      const totalPages = Math.ceil(count / limit);

      // Render the home page with movies data
      res.render('home', {
        movies,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        pageTitle: 'Movie Ratings - Home'
      });
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).render('error', { 
        message: 'Error fetching movies',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  },

  // Search for movies
  searchMovies: async (req, res) => {
    try {
      const { query } = req.query;
      const movies = await Movie.findAll({
        where: {
          title: {
            [Op.iLike]: `%${query}%` // Case-insensitive search
          }
        },
        limit: 10 // Limit the number of results
      });

      res.render('searchResults', { movies, query, pageTitle: 'Search Results' });
    } catch (error) {
      console.error('Error searching movies:', error);
      res.status(500).render('error', { 
        message: 'Error searching movies',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
};

module.exports = homeController;