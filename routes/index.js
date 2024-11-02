const express = require('express');
const router = express.Router();

const homeRoutes = require('./homeRoutes');
const movieRoutes = require('./movieRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

router.use('/', homeRoutes);
router.use('/movies', movieRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

router.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).render('error', { 
        title: '404 - Page Not Found',
        message: 'The page you requested could not be found.',
        pageTitle: '404 Error'
    });
});

module.exports = router;