const router = require('express').Router();
const { Review, Movie, User } = require('../models');

// Add a review
router.post('/:movieId', async (req, res) => {
    try {
        const newReview = await Review.create({
            content: req.body.content,
            userId: req.session.user_id,
            movieId: req.params.movieId
        });
        res.status(201).json(newReview);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update a review
router.put('/:id', async (req, res) => {
    try {
        const review = await Review.findOne({
            where: {
                id: req.params.id,
                userId: req.session.user_id
            }
        });

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        await review.update({ content: req.body.content });
        res.json({ message: 'Review updated' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get user's reviews and ratings
router.get('/user', async (req, res) => {
    try {
        const userData = await User.findByPk(req.session.user_id, {
            include: [
                {
                    model: Movie,
                    through: { 
                        model: Rating,
                        attributes: ['rating']
                    },
                    include: [Review]
                }
            ]
        });

        const user = userData.get({ plain: true });

        res.render('userRatings', {
            user,
            logged_in: true
        });
    } catch (err) {
        res.status(500).json(err);
    }
});