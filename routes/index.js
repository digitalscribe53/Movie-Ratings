const express = require('express');
const router = express.Router();

const homeRoutes = require('./homeRoutes');
const movieRoutes = require('./movieRoutes');
const userRoutes = require('./userRoutes');

router.use('/', homeRoutes);
router.use('/movies', movieRoutes);
router.use('/users', userRoutes);

module.exports = router;