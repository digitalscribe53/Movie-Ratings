const User = require('./User');
const Movie = require('./Movie');
const Rating = require('./Rating');
const Review = require('./Review');  

User.hasMany(Rating, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

Rating.belongsTo(User, {
    foreignKey: 'userId'
});

Movie.hasMany(Rating, {
    foreignKey: 'movieId',
    onDelete: 'CASCADE'
});

Rating.belongsTo(Movie, {
    foreignKey: 'movieId'
});

// Review associations
User.hasMany(Review, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

Review.belongsTo(User, {
    foreignKey: 'userId'
});

Movie.hasMany(Review, {
    foreignKey: 'movieId',
    onDelete: 'CASCADE'
});

Review.belongsTo(Movie, {
    foreignKey: 'movieId'
});

module.exports = { User, Movie, Rating, Review };