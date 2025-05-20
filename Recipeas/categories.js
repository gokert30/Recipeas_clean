// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        loadCategoryRecipes(category);
    } else {
        loadAllRecipes();
    }
});

async function loadCategoryRecipes(category) {
    const recipesContainer = document.getElementById('recipes-container');
    if (!recipesContainer) return;

    try {
        const querySnapshot = await db.collection('recipes')
            .where('category', '==', category.toLowerCase())
            .orderBy('likes', 'desc')
            .get();

        if (querySnapshot.empty) {
            recipesContainer.innerHTML = `
                <div class="info-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No recipes found in the ${category} category. Be the first to share!</p>
                </div>
            `;
            return;
        }

        recipesContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            const recipe = doc.data();
            const div = document.createElement('div');
            div.className = 'recipe-card';
            div.innerHTML = `
                <div class="recipe-card-content">
                    <a href="recipe.html?id=${doc.id}" class="recipe-title">${recipe.title}</a>
                    <p class="recipe-author">By ${recipe.creator}</p>
                    <div class="recipe-stats">
                        <span><i class="fas fa-heart"></i> ${recipe.likes || 0}</span>
                        <span><i class="fas fa-clock"></i> ${recipe.createdAt ? new Date(recipe.createdAt.toDate()).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <a href="recipe.html?id=${doc.id}" class="view-recipe">View Recipe</a>
                </div>
            `;
            recipesContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading category recipes:", error);
        recipesContainer.innerHTML = '<p class="error-message">Error loading recipes. Please try again later.</p>';
    }
}

async function loadAllRecipes() {
    const recipesContainer = document.getElementById('recipes-container');
    if (!recipesContainer) return;

    try {
        const querySnapshot = await db.collection('recipes')
            .orderBy('likes', 'desc')
            .get();

        if (querySnapshot.empty) {
            recipesContainer.innerHTML = `
                <div class="info-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No recipes found. Be the first to share!</p>
                </div>
            `;
            return;
        }

        recipesContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            const recipe = doc.data();
            const div = document.createElement('div');
            div.className = 'recipe-card';
            div.innerHTML = `
                <div class="recipe-card-content">
                    <a href="recipe.html?id=${doc.id}" class="recipe-title">${recipe.title}</a>
                    <p class="recipe-category"><i class="fas fa-tag"></i> ${recipe.category}</p>
                    <p class="recipe-author">By ${recipe.creator}</p>
                    <div class="recipe-stats">
                        <span><i class="fas fa-heart"></i> ${recipe.likes || 0}</span>
                        <span><i class="fas fa-clock"></i> ${recipe.createdAt ? new Date(recipe.createdAt.toDate()).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <a href="recipe.html?id=${doc.id}" class="view-recipe">View Recipe</a>
                </div>
            `;
            recipesContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading recipes:", error);
        recipesContainer.innerHTML = '<p class="error-message">Error loading recipes. Please try again later.</p>';
    }
} 