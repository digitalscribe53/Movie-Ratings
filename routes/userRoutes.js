const express = require('express');
const router = express.Router();
const { User, Movie, Rating } = require('../models');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcrypt');

// User registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = await User.create({
            username,
            email,
            password // Note: Password hashing is handled in the User model
        });

        // Generate token
        const token = authMiddleware.generateToken(newUser.id);

        res.status(201).json({ 
            message: 'User registered successfully', 
            userId: newUser.id,
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error in user registration', error: err.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await user.validPassword(password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = authMiddleware.generateToken(user.id);

        res.json({ message: 'Logged in successfully', userId: user.id, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error in user login', error: err.message });
    }
});

// Get user profile
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Movie,
                    through: Rating,
                    as: 'ratedMovies'
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user profile', error: err.message });
    }
});

// Update user profile
router.put('/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { username, email } = req.body;

        const [updatedRows] = await User.update(
            { username, email },
            { where: { id: req.user.id } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating user profile', error: err.message });
    }
});

// Change password
router.put('/change-password', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await user.validPassword(currentPassword);
        if (!validPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error changing password', error: err.message });
    }
});

// Get user's rated movies
router.get('/rated-movies', authMiddleware.verifyToken, async (req, res) => {
    try {
        const ratedMovies = await Rating.findAll({
            where: { userId: req.user.id },
            include: [{ model: Movie, attributes: ['id', 'title', 'imageSrc', 'averageRating'] }]
        });

        res.json(ratedMovies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching rated movies', error: err.message });
    }
});

// Logout (if using server-side sessions)
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;