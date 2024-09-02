const router = require('express').Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Assuming you have an isAdmin middleware
router.use(authMiddleware.isAdmin);

router.get('/add-movie', adminController.renderAddMovie);
router.post('/add-movie', adminController.addMovie);
router.get('/movies', adminController.listMovies);

module.exports = router;