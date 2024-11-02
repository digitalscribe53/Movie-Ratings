const express = require('express');
const router = express.Router();
const { Movie, Rating, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all movies (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        const { count, rows } = await Movie.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'imageSrc', 'averageRating']
        });

        const totalPages = Math.ceil(count / limit);

        res.render('movies', {
            movies: rows,
            currentPage: page,
            totalPages,
            logged_in: req.session.logged_in,
            pageTitle: 'All Movies'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Get a single movie by ID
router.get('/:id', async (req, res) => {
    try {
        const movieData = await Movie.findByPk(req.params.id, {
            include: [
                {
                    model: Rating,
                    include: [{ model: User, attributes: ['username'] }]
                }
            ]
        });

        if (!movieData) {
            res.status(404).render('movieDetails', { 
                message: 'Movie not found',
                logged_in: req.session.logged_in 
            });
            return;
        }

        const movie = movieData.get({ plain: true });
        
        // Debug log to check session state
        console.log('Session state:', {
            logged_in: req.session.logged_in,
            user_id: req.session.user_id
        });

        res.render('movieDetails', {
            movie,
            logged_in: req.session.logged_in,
            user_id: req.session.user_id,
            pageTitle: movie.title
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json(err);
    }
});

// Create a new movie (protected route, admin only)
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    try {
        const newMovie = await Movie.create(req.body);
        res.status(201).json(newMovie);
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

// Update a movie (protected route, admin only)
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    try {
        const updatedMovie = await Movie.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedMovie[0] === 0) {
            res.status(404).json({ message: 'No movie found with this id!' });
            return;
        }

        res.json({ message: 'Movie updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Delete a movie (protected route, admin only)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    try {
        const deletedMovie = await Movie.destroy({
            where: { id: req.params.id }
        });

        if (!deletedMovie) {
            res.status(404).json({ message: 'No movie found with this id!' });
            return;
        }

        res.json({ message: 'Movie deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// Rate a movie (protected route)
router.post('/:id/rate', async (req, res) => {
    try {
        if (!req.session.logged_in) {
            return res.status(401).json({ message: 'Please log in to rate movies' });
        }

        const { rating } = req.body;
        const movieId = req.params.id;
        const userId = req.session.user_id;

        const [ratingRecord, created] = await Rating.findOrCreate({
            where: { movieId, userId },
            defaults: { rating }
        });

        if (!created) {
            await ratingRecord.update({ rating });
        }

        // Update average rating for the movie
        const ratings = await Rating.findAll({ where: { movieId } });
        const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        await Movie.update({ averageRating }, { where: { id: movieId } });

        res.json({ message: 'Rating submitted successfully!', averageRating });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;