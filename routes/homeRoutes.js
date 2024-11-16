const express = require('express');
const router = express.Router();
const { Movie, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

// Home page route with pagination and search
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        const searchTerm = req.query.search || '';

        // Build search condition
        const whereCondition = searchTerm 
            ? {
                title: {
                    [Op.iLike]: `%${searchTerm.split('').join('%')}%`
                }
            } 
            : {};

        // Get total count and movies
        const { count, rows: movieData } = await Movie.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['createdAt', 'DESC']], // original sort
            attributes: ['id', 'title', 'imageSrc', 'averageRating']
        });

        const movies = movieData.map((movie) => movie.get({ plain: true }));

        // Calculate pagination values
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        res.render('home', {
            movies,
            currentPage: page,
            totalPages,
            pages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            previousPage: page - 1,
            nextPage: page + 1,
            searchTerm,
            loggedIn: req.session.loggedIn,
            pageTitle: searchTerm ? `Search: ${searchTerm} - Movie Ratings` : 'Movie Ratings - Home'
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

// Search route (can be removed to use the integrated search in home route)
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