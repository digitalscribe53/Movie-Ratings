const sequelize = require('../config/connection');
const { User, Movie, Rating } = require('../models');
const movieData = require('./movieData.json');

const seedDatabase = async () => {
  try {
    // Sync and reset database
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    // Create admin user
    const users = await User.bulkCreate([
      {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        isAdmin: true,
      }
    ], {
      individualHooks: true,
      returning: true,
    });
    console.log('Admin user created!');

    // Create movies
    await Movie.bulkCreate(movieData.movies);
    console.log('Movies seeded!');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();