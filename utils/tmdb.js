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
                averageRating: movie.vote_average / 2 // Convert TMDB's 10-point scale to our 5-point scale
            }));
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            throw error;
        }
    },

    // Search movies
    searchMovies: async (query, page = 1) => {
        try {
            const response = await axios.get(`${BASE_URL}/search/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    query: query,
                    page: page
                }
            });

            return response.data.results.map(movie => ({
                title: movie.title,
                description: movie.overview,
                releaseYear: new Date(movie.release_date).getFullYear(),
                imageSrc: `${IMAGE_BASE_URL}${movie.poster_path}`,
                averageRating: movie.vote_average / 2
            }));
        } catch (error) {
            console.error('Error searching movies:', error);
            throw error;
        }
    }
};

module.exports = tmdbAPI;