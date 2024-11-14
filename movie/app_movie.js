const API_KEY = 'd53a1aee8fa0ceff276f38712413e7f4';
let currentPage = 1;

const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');

// Show suggestions when typing in the input
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    if (query) {
        fetchMovies(query); // Fetch and display suggestions
        suggestions.style.display = 'block';
    } else {
        suggestions.style.display = 'none';
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
    }
});

// Prevent hiding suggestions when clicking inside the input or suggestions
searchInput.addEventListener('click', () => {
    if (searchInput.value) {
        suggestions.style.display = 'block';
    }
});

// Fetch movies based on search query and page
async function fetchMovies(query, page = 1) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${API_KEY}&page=${page}`);
        const data = await response.json();
        displayMovies(data.results);
        displaySuggestions(data.results);
        if (page === 1) displayPaginationButtons(data.total_pages); // Only display pagination on initial fetch
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Display suggestions in a dropdown
function displaySuggestions(movies) {
    suggestions.innerHTML = movies.map(movie => `<p>${movie.title}</p>`).join('');
    suggestions.style.display = 'block';
}

// Display movie cards in a grid
function displayMovies(movies) {
    const container = document.getElementById("movie-container");
    container.innerHTML = ""; // Clear previous content

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";
        movieCard.setAttribute("data-id", movie.id);
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
            <button onclick="toggleWatchlist(${movie.id}, '${movie.title}', '${movie.poster_path}')">Add to Watchlist</button>
        `;
        container.appendChild(movieCard);
    });
}

// Event delegation for movie card clicks to show movie details
document.getElementById("movie-container").addEventListener("click", function(event) {
    const movieCard = event.target.closest(".movie-card");
    if (movieCard && event.target.tagName !== 'BUTTON') {
        const movieId = movieCard.getAttribute("data-id");
        showMovieDetails(movieId);
    }
});

// Show movie details in a modal with a trailer
async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`);
        const movie = await response.json();
        
        const trailer = movie.videos.results.find(video => video.type === "Trailer");
        const trailerHTML = trailer
            ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
            : `<p>No trailer available</p>`;

        document.getElementById('movie-detail').innerHTML = `
            <h2>${movie.title}</h2>
            <p>${movie.overview}</p>
            <p>Rating: ${movie.vote_average}</p>
            <p>Runtime: ${movie.runtime} mins</p>
            <p>Cast: ${movie.credits.cast.slice(0, 5).map(c => c.name).join(', ')}</p>
            ${trailerHTML}
            <button id="close-modal">Close</button>
        `;
        document.getElementById('movie-modal').style.display = 'block';

        document.getElementById("close-modal").addEventListener("click", closeMovieModal);
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

// Close movie details modal
function closeMovieModal() {
    document.getElementById('movie-modal').style.display = 'none';
}

// Display pagination buttons
function displayPaginationButtons(totalPages) {
    const paginationDiv = document.getElementById('pagination-buttons');
    paginationDiv.innerHTML = `
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <button onclick="changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
}

// Change page for pagination
function changePage(change) {
    currentPage += change;
    const query = searchInput.value;
    if (query) fetchMovies(query, currentPage);
}

// Add or remove movie from watchlist
function toggleWatchlist(id, title, posterPath) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const movieIndex = watchlist.findIndex(movie => movie.id === id);

    if (movieIndex > -1) {
        watchlist.splice(movieIndex, 1);
        alert("Removed from Watchlist");
    } else {
        watchlist.push({ id, title, posterPath });
        alert("Added to Watchlist");
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
}

// Display watchlist count in header
function updateWatchlistCount() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    document.getElementById('watchlist-count').textContent = `Watchlist (${watchlist.length})`;
}
updateWatchlistCount(); // Initial watchlist count on load

// Display watchlist items in a grid
function displayWatchlist() {
    const watchlistContainer = document.getElementById('watchlist-container');
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    watchlistContainer.innerHTML = watchlist.length > 0
        ? watchlist.map(movie => `
            <div class="movie-card">
                <img src="https://image.tmdb.org/t/p/w200/${movie.posterPath}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <button onclick="toggleWatchlist(${movie.id}, '${movie.title}', '${movie.posterPath}')">Remove from Watchlist</button>
            </div>
        `).join('')
        : '<p>No movies in watchlist!</p>';

    document.getElementById('movie-container').style.display = 'none';
    watchlistContainer.style.display = 'grid';
}

// Show watchlist on button click
document.getElementById('show-watchlist-btn').addEventListener('click', displayWatchlist);

// Clear search input and suggestions
document.getElementById('clear-search-btn').addEventListener('click', () => {
    searchInput.value = '';
    suggestions.style.display = 'none';
    document.getElementById('movie-container').innerHTML = '';
});
