document.addEventListener('DOMContentLoaded', () => {
    const ratingElements = document.querySelectorAll('.rating');
    const movieCards = document.querySelectorAll('.movie-card');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const toggleIcon = document.getElementById('toggle-icon');

    // Render stars for all rating elements
    ratingElements.forEach(ratingElement => {
        const rating = parseFloat(ratingElement.getAttribute('data-rating'));
        renderStars(ratingElement, rating);
    });

    // Add click event listeners to movie cards
    movieCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            const movieId = card.getAttribute('data-id');
            fetchMovieDetails(movieId);
        });
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.getElementById('navbar').classList.toggle('dark-mode');
        movieCards.forEach(card => card.classList.toggle('dark-mode'));
        if (document.body.classList.contains('dark-mode')) {
            toggleIcon.innerHTML = '<i class="fas fa-sun" style="color: orange;"></i>';
        } else {
            toggleIcon.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Apply dark mode on load if previously set
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('navbar').classList.add('dark-mode');
        movieCards.forEach(card => card.classList.add('dark-mode'));
        toggleIcon.innerHTML = '<i class="fas fa-sun" style="color: orange;"></i>';
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.movieId) {
            fetchMovieDetails(event.state.movieId);
        } else {
            location.reload(); // Reload to go back to the main page
        }
    });

    function renderStars(element, rating) {
        element.innerHTML = ''; // Clear existing stars
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.classList.add('star');
            if (rating >= i) {
                star.classList.add('full');
            } else if (rating >= i - 0.5) {
                star.classList.add('half');
            }
            star.innerHTML = '★';
            element.appendChild(star);
        }
    }

    function fetchMovieDetails(movieId) {
        fetch(`/api/movies/${movieId}`)
            .then(response => response.json())
            .then(movie => {
                displayMovieDetails(movie);
                history.pushState({ movieId }, movie.title, `/movies/${movieId}`);
            })
            .catch(error => console.error('Error:', error));
    }

    function displayMovieDetails(movie) {
        const mainContent = document.querySelector('.container');
        mainContent.innerHTML = `
            <div class="movie-details" style="padding: 1rem;">
                <div class="content has-text-centered">
                    <h1 class="title is-5">${movie.title}</h1>
                    <div class="rating" data-rating="${movie.averageRating}">
                        <!-- Stars will be generated here by JavaScript -->
                    </div>
                </div>
                <div class="card" style="margin: auto; width: 25%; border-radius: 10px; overflow: hidden;">
                    <div class="card-image">
                        <figure class="image is-3by4">
                            <img src="${movie.imageSrc}" alt="${movie.title}" style="width: 100%; height: auto;">
                        </figure>
                    </div>
                </div>
                <article class="content" style="padding-top: 2rem;">
                    <h2 class="subtitle">Description</h2>
                    <p>${movie.description}</p>
                </article>
            </div>
        `;

        // Render the stars for the movie details page
        const ratingElement = mainContent.querySelector('.rating');
        renderStars(ratingElement, movie.averageRating);
    }
});