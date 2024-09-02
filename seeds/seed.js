const sequelize = require('../config/connection');
const { User, Movie } = require('../models');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const users = await User.bulkCreate([
    {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      isAdmin: true,
    },
    // ... other users ...
  ], {
    individualHooks: true,
    returning: true,
  });

  // ... seed other data ...

  process.exit(0);
};

seedDatabase();