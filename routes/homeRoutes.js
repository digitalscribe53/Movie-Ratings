const express = require('express');
const router = express.Router();
const { Movie, User } = require('../models');
const authMiddleware = require('../middleware/auth');

// Home page route
router.get('/', async (req, res) => {
    try {
        // Fetch movies for the home page
        const movieData = await Movie.findAll({
            limit: 12, // Limit to 12 movies for the home page
            order: [['createdAt', 'DESC']], // Sort by newest first
            attributes: ['id', 'title', 'imageSrc', 'averageRating']
        });

        const movies = movieData.map((movie) => movie.get({ plain: true }));

        res.render('home', { 
            movies, 
            loggedIn: req.session.loggedIn,
            pageTitle: 'Movie Ratings - Home'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// About page route
router.get('/about', (req, res) => {
    res.render('about', { 
        loggedIn: req.session.loggedIn,
        pageTitle: 'About Us'
    });
});

// Contact page route
router.get('/contact', (req, res) => {
    res.render('contact', { 
        loggedIn: req.session.loggedIn,
        pageTitle: 'Contact Us'
    });
});

// Search route
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const movieData = await Movie.findAll({
            where: {
                title: {
                    [Op.iLike]: `%${query}%`
                }
            },
            limit: 10,
            attributes: ['id', 'title', 'imageSrc', 'averageRating']
        });

        const movies = movieData.map((movie) => movie.get({ plain: true }));

        res.render('searchResults', { 
            movies, 
            query,
            loggedIn: req.session.loggedIn,
            pageTitle: 'Search Results'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// User profile route (protected)
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userData = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Movie, through: 'Rating', as: 'ratedMovies' }]
        });

        const user = userData.get({ plain: true });

        res.render('profile', {
            ...user,
            loggedIn: true,
            pageTitle: 'Your Profile'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;