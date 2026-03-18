const BASE_SERVINGS = 4;

const state = {
  recipes: [],
  selectedRecipeId: null,
  filters: {
    name: "",
    includeIngredients: [],
    fridgeIngredients: []
  },
  targetServings: BASE_SERVINGS
};

const refs = {
  status: document.getElementById("status"),
  searchByName: document.getElementById("searchByName"),
  searchByIngredients: document.getElementById("searchByIngredients"),
  fridgeIngredients: document.getElementById("fridgeIngredients"),
  recipeList: document.getElementById("recipeList"),
  recipeDetail: document.getElementById("recipeDetail"),
  loadBtn: document.getElementById("loadBtn")
};

function setStatus(message, isError = false) {
  refs.status.textContent = message;
  refs.status.style.color = isError ? "#8b1f1f" : "#24375a";
}

function parseIngredientInput(text) {
  return text
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeRecipes(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((recipe, index) => {
      if (!recipe || !recipe.name) {
        return null;
      }

      const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
            .map((ingredient) => {
              if (!ingredient || !ingredient.name) {
                return null;
              }

              return {
                name: String(ingredient.name).trim(),
                quantity: Number(ingredient.quantity) || 0,
                unit: ingredient.unit ? String(ingredient.unit).trim() : ""
              };
            })
            .filter(Boolean)
        : [];

      const steps = Array.isArray(recipe.steps)
        ? recipe.steps.map((step) => String(step).trim()).filter(Boolean)
        : [];

      const drinks = Array.isArray(recipe.drinks)
        ? recipe.drinks.map((drink) => String(drink).trim()).filter(Boolean)
        : [];

      return {
        id: recipe.id || `recipe-${Date.now()}-${index}`,
        name: String(recipe.name).trim(),
        category: recipe.category ? String(recipe.category).trim() : "Plat",
        baseServings: Number(recipe.baseServings) || BASE_SERVINGS,
        ingredients,
        steps,
        drinks
      };
    })
    .filter(Boolean);
}

function getSelectedRecipe() {
  return state.recipes.find((recipe) => recipe.id === state.selectedRecipeId) || null;
}

function getScaleFactor(recipe) {
  const base = recipe.baseServings || BASE_SERVINGS;
  return state.targetServings / base;
}

function formatQuantity(quantity) {
  const rounded = Math.round(quantity * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function getFilteredRecipes() {
  return state.recipes.filter((recipe) => {
    const lowerName = recipe.name.toLowerCase();
    const recipeIngredientNames = recipe.ingredients.map((ingredient) => ingredient.name.toLowerCase());

    const matchesName = !state.filters.name || lowerName.includes(state.filters.name);
    const matchesIngredients = state.filters.includeIngredients.every((item) =>
      recipeIngredientNames.some((name) => name.includes(item))
    );

    const fridgeTerms = state.filters.fridgeIngredients;
    const matchingFridgeCount = fridgeTerms.filter((term) =>
      recipeIngredientNames.some((name) => name.includes(term))
    ).length;

    recipe._fridgeMatchCount = matchingFridgeCount;

    const matchesFridge =
      fridgeTerms.length === 0 ? true : matchingFridgeCount > 0;

    return matchesName && matchesIngredients && matchesFridge;
  });
}

function renderRecipeList() {
  const filtered = getFilteredRecipes().sort((a, b) => {
    if (state.filters.fridgeIngredients.length > 0) {
      return b._fridgeMatchCount - a._fridgeMatchCount;
    }
    return a.name.localeCompare(b.name, "fr");
  });

  refs.recipeList.innerHTML = "";

  if (filtered.length === 0) {
    refs.recipeList.innerHTML = '<p class="empty-state">Aucune recette ne correspond a la recherche.</p>';
    return;
  }

  filtered.forEach((recipe) => {
    const card = document.createElement("article");
    card.className = "recipe-card";
    if (recipe.id === state.selectedRecipeId) {
      card.classList.add("active");
    }

    card.innerHTML = `
      <strong>${recipe.name}</strong>
      <div class="recipe-meta">${recipe.category} • ${recipe.ingredients.length} ingredient(s)</div>
      ${state.filters.fridgeIngredients.length > 0 ? `<div class="match-note">${recipe._fridgeMatchCount} ingredient(s) du frigo retrouve(s)</div>` : ""}
    `;

    card.addEventListener("click", () => {
      state.selectedRecipeId = recipe.id;
      state.targetServings = recipe.baseServings || BASE_SERVINGS;
      renderAll();
    });

    refs.recipeList.appendChild(card);
  });
}

function renderRecipeDetail() {
  const recipe = getSelectedRecipe();
  refs.recipeDetail.innerHTML = "";

  if (!recipe) {
    refs.recipeDetail.classList.add("empty-state");
    refs.recipeDetail.textContent = "Selectionne une recette pour voir le detail.";
    return;
  }

  refs.recipeDetail.classList.remove("empty-state");

  const scale = getScaleFactor(recipe);

  const header = document.createElement("div");
  header.innerHTML = `
    <h3>${recipe.name}</h3>
    <span class="badge">${recipe.category}</span>
  `;

  const servingsLabel = document.createElement("label");
  servingsLabel.textContent = "Nombre de personnes";

  const servingsInput = document.createElement("input");
  servingsInput.type = "number";
  servingsInput.min = "1";
  servingsInput.step = "1";
  servingsInput.value = String(state.targetServings);

  servingsInput.addEventListener("input", () => {
    const value = Number(servingsInput.value);
    if (!Number.isNaN(value) && value > 0) {
      state.targetServings = value;
      renderRecipeDetail();
    }
  });

  servingsLabel.appendChild(servingsInput);

  const ingredientsTitle = document.createElement("h3");
  ingredientsTitle.textContent = "Ingredients";
  const ingredientsList = document.createElement("ul");

  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    const qty = ingredient.quantity * scale;
    const suffix = ingredient.unit ? ` ${ingredient.unit}` : "";
    li.textContent = `${ingredient.name}: ${formatQuantity(qty)}${suffix}`;
    ingredientsList.appendChild(li);
  });

  const stepsTitle = document.createElement("h3");
  stepsTitle.textContent = "Etapes";
  const stepsList = document.createElement("ol");

  recipe.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });

  refs.recipeDetail.append(header, servingsLabel, ingredientsTitle, ingredientsList, stepsTitle, stepsList);

  if (recipe.drinks.length > 0) {
    const drinksTitle = document.createElement("h3");
    drinksTitle.textContent = "Boissons conseillees";
    const drinksList = document.createElement("ul");

    recipe.drinks.forEach((drink) => {
      const li = document.createElement("li");
      li.textContent = drink;
      drinksList.appendChild(li);
    });

    refs.recipeDetail.append(drinksTitle, drinksList);
  }
}

function renderAll() {
  renderRecipeList();
  renderRecipeDetail();
}

async function loadRecipesFromRoot(showStatus = true) {
  try {
    const response = await fetch("./recettes.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Fichier introuvable (code ${response.status})`);
    }

    const data = await response.json();
    state.recipes = normalizeRecipes(data);

    if (state.recipes.length > 0) {
      state.selectedRecipeId = state.recipes[0].id;
      state.targetServings = state.recipes[0].baseServings || BASE_SERVINGS;
    } else {
      state.selectedRecipeId = null;
      state.targetServings = BASE_SERVINGS;
    }

    renderAll();
    if (showStatus) {
      setStatus(`${state.recipes.length} recette(s) chargee(s) depuis recettes.json.`);
    }
  } catch (error) {
    if (showStatus) {
      setStatus(`Chargement impossible: ${error.message}.`, true);
    }
  }
}

function bindEvents() {
  refs.loadBtn.addEventListener("click", () => loadRecipesFromRoot(true));

  refs.searchByName.addEventListener("input", () => {
    state.filters.name = refs.searchByName.value.trim().toLowerCase();
    renderRecipeList();
  });

  refs.searchByIngredients.addEventListener("input", () => {
    state.filters.includeIngredients = parseIngredientInput(refs.searchByIngredients.value);
    renderRecipeList();
  });

  refs.fridgeIngredients.addEventListener("input", () => {
    state.filters.fridgeIngredients = parseIngredientInput(refs.fridgeIngredients.value);
    renderRecipeList();
  });
}

function init() {
  bindEvents();
  renderAll();
  loadRecipesFromRoot(false);
}

init();
