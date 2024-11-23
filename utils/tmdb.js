const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const tmdbAPI = {
    // Get popular movies
    getPopularMovies: async (page = 1) => {
        try {
            const response = await axios.get(`${BASE_URL}/movie/popular`, {
                params: {
                    api_key: TMDB_API_KEY,
                    page: page
                }
            });
            
            return response.data.results.map(movie => ({
                title: movie.title,
                description: movie.overview,
                releaseYear: new Date(movie.release_date).getFullYear(),
                imageSrc: `${IMAGE_BASE_URL}${movie.poster_path}`,
                averageRating: movie.vote_average / 2, // Convert TMDB's 10-point scale to our 5-point scale
                tmdbId: movie.id // Add this line to include TMDB ID
            }));
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            throw error;
        }
    },

    // Get movie details
    getMovieDetails: async (movieId) => {
        try {
            const movieResponse = await axios.get(`${BASE_URL}/movie/${movieId}`, {
                params: {
                    api_key: TMDB_API_KEY
                }
            });

            const reviewsResponse = await axios.get(`${BASE_URL}/movie/${movieId}/reviews`, {
                params: {
                    api_key: TMDB_API_KEY
                }
            });

            return {
                tmdbRating: movieResponse.data.vote_average,
                tmdbReviews: reviewsResponse.data.results,
                voteCount: movieResponse.data.vote_count
            };
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return {
                tmdbRating: 0,
                tmdbReviews: [],
                voteCount: 0
            };
        }
    }
};

module.exports = tmdbAPI;