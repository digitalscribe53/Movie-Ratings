const { Movie } = require('../models');
const tmdbAPI = require('../utils/tmdb');
const sequelize = require('../config/connection');

const seedMoviesFromTMDB = async () => {
    try {
        await sequelize.sync({ force: true }); // Be careful with force: true as it drops existing tables

        // Fetch first 5 pages of popular movies (100 movies)
        for (let page = 1; page <= 5; page++) {
            const movies = await tmdbAPI.getPopularMovies(page);
            await Movie.bulkCreate(movies);
            console.log(`Added movies from page ${page}`);
        }

        console.log('Database successfully seeded with TMDB movies!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedMoviesFromTMDB();