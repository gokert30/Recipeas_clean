// Firebase configuration
const firebaseConfig = {
    apiKey: 
    authDomain: 
    projectId: 
    storageBucket: 
    messagingSenderId: 
    appId: 
    measurementId: 
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Handle user authentication state
auth.onAuthStateChanged((user) => {
    const logoutBtn = document.getElementById('logout');
    const profileLink = document.getElementById('profile-link');
    const loginLink = document.getElementById('login-link');
    const userEmailElement = document.getElementById('user-email');
    const authContainer = document.getElementById('auth-container');
    const profileContainer = document.getElementById('profile-container');
    const authError = document.getElementById('auth-error');
    
    if (user) {
        // User is signed in
        if (logoutBtn) logoutBtn.style.display = 'inline';
        if (profileLink) profileLink.style.display = 'inline';
        if (loginLink) loginLink.style.display = 'none';
        if (userEmailElement) userEmailElement.innerText = user.email;

        if (window.location.pathname.includes('profile.html')) {
            if (profileContainer) profileContainer.style.display = 'block';
            if (authContainer) authContainer.style.display = 'none';
            loadUserRecipes(user.uid);
        }
        if (window.location.pathname.includes('index.html')) {
            loadTopRecipesPreview();
        }
    } else {
        // User is signed out
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline';

        if (window.location.pathname.includes('profile.html')) {
            if (authContainer) authContainer.style.display = 'block';
            if (profileContainer) profileContainer.style.display = 'none';
        }
    }
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for buttons
    const signupBtn = document.getElementById("signup-btn");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout");
    const authError = document.getElementById("auth-error");

    if (signupBtn) {
        signupBtn.addEventListener("click", async () => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (!email || !password) {
                if (authError) {
                    authError.textContent = "Please fill in all fields";
                    authError.style.display = "block";
                }
                return;
            }

            try {
                await auth.createUserWithEmailAndPassword(email, password);
                alert("Signup successful!");
                window.location.href = "index.html";
            } catch (error) {
                console.error("Signup error:", error);
                if (authError) {
                    authError.textContent = error.message;
                    authError.style.display = "block";
                }
            }
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (!email || !password) {
                if (authError) {
                    authError.textContent = "Please fill in all fields";
                    authError.style.display = "block";
                }
                return;
            }

            try {
                await auth.signInWithEmailAndPassword(email, password);
                alert("Login successful!");
                window.location.href = "index.html";
            } catch (error) {
                console.error("Login error:", error);
                if (authError) {
                    authError.textContent = error.message;
                    authError.style.display = "block";
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await auth.signOut();
                alert("Logged out successfully!");
                window.location.href = "index.html";
            } catch (error) {
                console.error("Logout error:", error);
                alert("Error logging out: " + error.message);
            }
        });
    }

    // Get recipe ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (recipeId) {
        currentRecipeId = recipeId;
        loadRecipe(recipeId, currentRegion);
    }
});

// Functions to load recipes, categories, etc.
async function loadUserRecipes(uid) {
    const userRecipes = document.getElementById('user-recipes');
    if (!userRecipes) return;
    
    userRecipes.innerHTML = '';

    try {
        const querySnapshot = await db.collection('recipes').where('creator', '==', uid).get();

        if (querySnapshot.empty) {
            userRecipes.innerHTML = '<p class="info-message">You haven\'t published any recipes yet.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const recipe = doc.data();
            const div = document.createElement('div');
            div.className = 'recipe-card';
            div.innerHTML = `
                <div class="recipe-card-content">
                    <a href="recipe.html?id=${doc.id}" class="recipe-title">${recipe.title}</a>
                    <div class="recipe-card-actions">
                        <button class="edit-btn" onclick="editRecipe('${doc.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deleteRecipe('${doc.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            userRecipes.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading recipes:", error);
        userRecipes.innerHTML = '<p class="error-message">Error loading recipes. Please try again later.</p>';
    }
}

// Recipe management functions
async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
        await db.collection('recipes').doc(recipeId).delete();
        alert('Recipe deleted successfully!');
        window.location.reload();
    } catch (error) {
        console.error("Error deleting recipe:", error);
        alert('Error deleting recipe: ' + error.message);
    }
}

async function editRecipe(recipeId) {
    try {
        const doc = await db.collection('recipes').doc(recipeId).get();
        if (doc.exists) {
            const recipe = doc.data();
            // Populate the form with recipe data
            document.getElementById('title').value = recipe.title;
            document.getElementById('category').value = recipe.category;
            document.getElementById('ingredients').value = recipe.ingredients;
            document.getElementById('preparation').value = recipe.preparation;
            document.getElementById('cooking').value = recipe.cooking;
            
            // Change the publish button to update
            const publishBtn = document.querySelector('.publish-btn');
            publishBtn.innerHTML = '<i class="fas fa-save"></i> Update Recipe';
            publishBtn.onclick = () => updateRecipe(recipeId);
        }
    } catch (error) {
        console.error("Error loading recipe for edit:", error);
        alert('Error loading recipe: ' + error.message);
    }
}

async function updateRecipe(recipeId) {
    try {
        const recipeData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            ingredients: document.getElementById('ingredients').value,
            preparation: document.getElementById('preparation').value,
            cooking: document.getElementById('cooking').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('recipes').doc(recipeId).update(recipeData);
        alert('Recipe updated successfully!');
        window.location.reload();
    } catch (error) {
        console.error("Error updating recipe:", error);
        alert('Error updating recipe: ' + error.message);
    }
}

// Enhanced recipe publishing
async function uploadRecipe() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please log in to publish a recipe');
        return;
    }

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const ingredients = document.getElementById('ingredients').value;
    const preparation = document.getElementById('preparation').value;
    const cooking = document.getElementById('cooking').value;

    if (!title || !category || !ingredients || !preparation || !cooking) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const recipeData = {
            title,
            category,
            ingredients,
            preparation,
            cooking,
            creator: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('recipes').add(recipeData);
        
        // Clear the form fields
        document.getElementById('title').value = '';
        document.getElementById('category').value = '';
        document.getElementById('ingredients').value = '';
        document.getElementById('preparation').value = '';
        document.getElementById('cooking').value = '';
        
        alert('Recipe published successfully!');
        window.location.reload();
    } catch (error) {
        console.error("Error publishing recipe:", error);
        alert('Error publishing recipe: ' + error.message);
    }
}

// Like functionality
async function likeRecipe() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please log in to like recipes');
        return;
    }

    const recipeId = window.location.pathname.split('/').pop().replace('.html', '');
    const recipeRef = db.collection('recipes').doc(recipeId);
    const likesRef = recipeRef.collection('likes').doc(user.uid);

    try {
        const likeDoc = await likesRef.get();
        if (likeDoc.exists) {
            // Unlike
            await likesRef.delete();
            await recipeRef.update({
                likes: firebase.firestore.FieldValue.increment(-1)
            });
        } else {
            // Like
            await likesRef.set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await recipeRef.update({
                likes: firebase.firestore.FieldValue.increment(1)
            });
        }
        updateLikeButton(recipeId);
    } catch (error) {
        console.error("Error updating like:", error);
        alert('Error updating like: ' + error.message);
    }
}

async function updateLikeButton(recipeId) {
    const user = auth.currentUser;
    if (!user) return;

    const likeButton = document.querySelector('.like-button');
    const likesCount = document.getElementById('recipe-likes');
    if (!likeButton || !likesCount) return;

    try {
        const recipeDoc = await db.collection('recipes').doc(recipeId).get();
        const recipe = recipeDoc.data();
        const likeDoc = await db.collection('recipes').doc(recipeId).collection('likes').doc(user.uid).get();

        likesCount.textContent = recipe.likes || 0;
        likeButton.classList.toggle('liked', likeDoc.exists);
    } catch (error) {
        console.error("Error updating like button:", error);
    }
}

// Localization functionality
let currentRecipeId = null;
let currentRegion = 'original';

function changeRegion() {
    const regionSelect = document.getElementById('region-select');
    currentRegion = regionSelect.value;
    loadRecipe(currentRecipeId, currentRegion);
}

function createLocalization() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please log in to create a local version');
        return;
    }

    const modal = document.getElementById('localization-modal');
    modal.style.display = 'block';

    // Pre-fill the form with the original recipe data
    const recipe = document.getElementById('recipe-container').dataset.recipe;
    if (recipe) {
        const recipeData = JSON.parse(recipe);
        document.getElementById('local-title').value = recipeData.title;
        document.getElementById('local-ingredients').value = recipeData.ingredients;
        document.getElementById('local-preparation').value = recipeData.preparation;
        document.getElementById('local-cooking').value = recipeData.cooking;
    }
}

function closeModal() {
    const modal = document.getElementById('localization-modal');
    modal.style.display = 'none';
}

async function saveLocalization() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please log in to create a local version');
        return;
    }

    const region = document.getElementById('local-region').value;
    const title = document.getElementById('local-title').value;
    const ingredients = document.getElementById('local-ingredients').value;
    const preparation = document.getElementById('local-preparation').value;
    const cooking = document.getElementById('local-cooking').value;

    if (!title || !ingredients || !preparation || !cooking) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const localizationData = {
            originalRecipeId: currentRecipeId,
            region,
            title,
            ingredients,
            preparation,
            cooking,
            creator: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('recipe_localizations').add(localizationData);
        
        // Update the original recipe's localization count
        await db.collection('recipes').doc(currentRecipeId).update({
            localizations: firebase.firestore.FieldValue.increment(1)
        });

        // Close the modal and reload the recipe
        closeModal();
        loadRecipe(currentRecipeId, region);
        
        alert('Local version created successfully!');
    } catch (error) {
        console.error("Error saving localization:", error);
        alert('Error saving localization: ' + error.message);
    }
}

async function loadRecipe(recipeId, region = 'original') {
    if (!recipeId) return;

    try {
        let recipeData;
        if (region === 'original') {
            const doc = await db.collection('recipes').doc(recipeId).get();
            if (!doc.exists) {
                alert('Recipe not found');
                return;
            }
            recipeData = doc.data();
        } else {
            const querySnapshot = await db.collection('recipe_localizations')
                .where('originalRecipeId', '==', recipeId)
                .where('region', '==', region)
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                alert('No local version found for this region');
                return;
            }

            const doc = querySnapshot.docs[0];
            recipeData = doc.data();
        }

        // Update the UI elements
        const recipeTitle = document.getElementById('recipe-title');
        const recipeAuthor = document.getElementById('recipe-author');
        const recipeIngredients = document.getElementById('recipe-ingredients');
        const recipePreparation = document.getElementById('recipe-preparation');
        const recipeCooking = document.getElementById('recipe-cooking');
        const localizationInfo = document.getElementById('localization-info');

        if (recipeTitle) recipeTitle.textContent = recipeData.title;
        if (recipeAuthor) recipeAuthor.textContent = recipeData.creator;
        if (recipeIngredients) recipeIngredients.innerHTML = recipeData.ingredients;
        if (recipePreparation) recipePreparation.innerHTML = recipeData.preparation;
        if (recipeCooking) recipeCooking.innerHTML = recipeData.cooking;

        // Update localization info
        if (localizationInfo) {
            if (region === 'original') {
                localizationInfo.innerHTML = `
                    <h3><i class="fas fa-globe"></i> Original Version</h3>
                    <p>This is the original recipe. Select a region to view or create a local version.</p>
                `;
            } else {
                localizationInfo.innerHTML = `
                    <h3><i class="fas fa-map-marker-alt"></i> ${region.replace('-', ' ').toUpperCase()} Version</h3>
                    <p>This is a localized version of the recipe, adapted for ${region.replace('-', ' ')}.</p>
                `;
            }
        }

        // Update like button state
        updateLikeButton(recipeId);
    } catch (error) {
        console.error("Error loading recipe:", error);
        alert('Error loading recipe: ' + error.message);
    }
}

// Update the existing loadTopRecipesPreview function to include localization info
async function loadTopRecipesPreview() {
    const topRecipesPreview = document.getElementById('top-recipes-preview');
    if (!topRecipesPreview) return;

    try {
        const querySnapshot = await db.collection('recipes')
            .orderBy('likes', 'desc')
            .limit(6)
            .get();

        if (querySnapshot.empty) {
            topRecipesPreview.innerHTML = '<p class="info-message">No recipes found. Be the first to share!</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const recipe = doc.data();
            const div = document.createElement('div');
            div.className = 'recipe-card';
            div.innerHTML = `
                <div class="recipe-card-content">
                    <h3>${recipe.title}</h3>
                    <p class="recipe-author">By ${recipe.creator}</p>
                    <div class="recipe-stats">
                        <span><i class="fas fa-heart"></i> ${recipe.likes || 0}</span>
                        <span><i class="fas fa-clock"></i> ${recipe.createdAt ? new Date(recipe.createdAt.toDate()).toLocaleDateString() : 'N/A'}</span>
                        <span><i class="fas fa-globe"></i> ${recipe.localizations || 0} versions</span>
                    </div>
                    <a href="recipe.html?id=${doc.id}" class="view-recipe">View Recipe</a>
                </div>
            `;
            topRecipesPreview.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading recipes:", error);
        topRecipesPreview.innerHTML = '<p class="error-message">Error loading recipes. Please try again later.</p>';
    }
}

// Initialize categories
const categories = [
    { id: 'breakfast', name: 'Breakfast', icon: 'fa-coffee' },
    { id: 'lunch', name: 'Lunch', icon: 'fa-utensils' },
    { id: 'dinner', name: 'Dinner', icon: 'fa-moon' },
    { id: 'dessert', name: 'Dessert', icon: 'fa-ice-cream' },
    { id: 'snacks', name: 'Snacks', icon: 'fa-cookie' },
    { id: 'drinks', name: 'Drinks', icon: 'fa-glass-martini-alt' }
];

function loadCategories() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;

    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}
