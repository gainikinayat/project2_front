const API_KEY = 'ab49bd86a2124f30bb6275fdc08ab868';

async function fetchRecipes(query) {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${API_KEY}`);
    const data = await response.json();
    displayRecipes(data.results);
    // displaySuggestions(data.results);  // Added to show suggestions as the user types
}

document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value;
    if (query) fetchRecipes(query);
});
function displaySuggestions(recipes) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = recipes
        .map(recipe => `<p onclick="fetchRecipes('${recipe.title}')">${recipe.title}</p>`)
        .join('');
}

function displayRecipes(recipes) {
    const container = document.getElementById('recipe-container');
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" data-id="${recipe.id}" onclick="showRecipeDetails(${recipe.id})">
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Ready in ${recipe.readyInMinutes} mins</p>
            <p class="recipe-summary">${recipe.summary ? recipe.summary.slice(0, 100) + '...' : 'No description available.'}</p>
            <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes})">
                ❤️ Add to Favorites
            </button>
        </div>
    `).join('');
}

async function showRecipeDetails(recipeId) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${API_KEY}`);
    const recipe = await response.json();
    document.getElementById('recipe-detail').innerHTML = `
        <h2>${recipe.title}</h2>
        <p><strong>Ingredients:</strong> ${recipe.extendedIngredients.map(i => i.original).join(', ')}</p>
        <p><strong>Instructions:</strong> ${recipe.instructions || 'No instructions available.'}</p>
        <p><strong>Nutrition:</strong> 
            Calories: ${recipe.nutrition.nutrients.find(n => n.name === "Calories")?.amount || 'N/A'} kcal, 
            Protein: ${recipe.nutrition.nutrients.find(n => n.name === "Protein")?.amount || 'N/A'} g, 
            Fat: ${recipe.nutrition.nutrients.find(n => n.name === "Fat")?.amount || 'N/A'} g
        </p>
    `;
    document.getElementById('recipe-modal').style.display = 'flex';
}

// Toggle between showing all recipes and favorites
document.getElementById('show-favorites-btn').addEventListener('click', () => {
    console.log("Show Favorites button clicked");
    const recipeContainer = document.getElementById('recipe-container');
    const favoritesContainer = document.getElementById('favorites-container');
    const showFavorites = favoritesContainer.style.display === 'none';

    if (showFavorites) {
        displayFavorites();
        recipeContainer.style.display = 'none';
        favoritesContainer.style.display = 'grid';
        document.getElementById('show-favorites-btn').textContent = "Show All Recipes";
        console.log("Displaying Favorites");
    } else {
        recipeContainer.style.display = 'grid';
        favoritesContainer.style.display = 'none';
        document.getElementById('show-favorites-btn').textContent = "Show Favorites";
        console.log("Displaying All Recipes");
    }
});


// Function to display favorites
function displayFavorites() {
    const favoritesContainer = document.getElementById('favorites-container');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favoritesContainer.innerHTML = favorites.length > 0
        ? favorites.map(recipe => `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                <p>Ready in ${recipe.readyInMinutes} mins</p>
                <button class="favorite-btn" onclick="toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes})">
                    ❤️ Remove from Favorites
                </button>
            </div>
        `).join('')
        : '<p>No favorites yet!</p>';
}

// Function to add or remove favorites
function toggleFavorite(id, title, image, readyInMinutes) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const recipeIndex = favorites.findIndex(recipe => recipe.id === id);

    if (recipeIndex > -1) {
        favorites.splice(recipeIndex, 1);  // Remove from favorites
        alert("Removed from favorites!");
    } else {
        favorites.push({ id, title, image, readyInMinutes });  // Add to favorites
        alert("Added to favorites!");
    }

    // Update localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
}
document.getElementById('recipe-modal').addEventListener('click', (e) => {
    if (e.target.id === 'recipe-modal') {
        document.getElementById('recipe-modal').style.display = 'none';
    }
});
