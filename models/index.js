const Movie = require('./Movie');
const Rating = require('./Rating');
const User = require('./User');

// User-Rating Association
User.hasMany(Rating, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
Rating.belongsTo(User, {
  foreignKey: 'userId'
});

// Movie-Rating Association
Movie.hasMany(Rating, {
  foreignKey: 'movieId',
  onDelete: 'CASCADE'
});
Rating.belongsTo(Movie, {
  foreignKey: 'movieId'
});

module.exports = {
  Movie,
  Rating,
  User
};