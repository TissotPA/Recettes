const BASE_SERVINGS = 4;

const state = {
  recipes: [],
  selectedRecipeId: null,
  editingRecipeId: null,
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
  openAddRecipeBtn: document.getElementById("openAddRecipeBtn"),
  addRecipeDialog: document.getElementById("addRecipeDialog"),
  addRecipeForm: document.getElementById("addRecipeForm"),
  addIngredientRowBtn: document.getElementById("addIngredientRowBtn"),
  ingredientsRows: document.getElementById("ingredientsRows"),
  ingredientRowTemplate: document.getElementById("ingredientRowTemplate"),
  cancelAddRecipeBtn: document.getElementById("cancelAddRecipeBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFileInput: document.getElementById("importFileInput")
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

function updateScaledIngredientQuantities(recipe) {
  const ingredientsList = refs.recipeDetail.querySelector(".ingredients-list");
  if (!ingredientsList) {
    return;
  }

  const scale = getScaleFactor(recipe);
  const quantityNodes = ingredientsList.querySelectorAll(".ingredient-scaled-value");

  quantityNodes.forEach((node) => {
    const baseQuantity = Number(node.dataset.baseQuantity);
    const unit = node.dataset.unit || "";
    const suffix = unit ? ` ${unit}` : "";
    const scaled = (Number.isNaN(baseQuantity) ? 0 : baseQuantity) * scale;
    node.textContent = `${formatQuantity(scaled)}${suffix}`;
  });
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
    refs.recipeList.innerHTML = '<p class="empty-state">Aucune recette ne correspond à la recherche.</p>';
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
      <div class="recipe-meta">${recipe.category} • ${recipe.ingredients.length} ingrédient(s)</div>
      ${state.filters.fridgeIngredients.length > 0 ? `<div class="match-note">${recipe._fridgeMatchCount} ingrédient(s) du frigo retrouvé(s)</div>` : ""}
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
      updateScaledIngredientQuantities(recipe);
    }
  });

  servingsLabel.appendChild(servingsInput);

  const ingredientsTitle = document.createElement("h3");
    ingredientsTitle.textContent = "Ingrédients";
  const ingredientsList = document.createElement("ul");
  ingredientsList.className = "ingredients-list";

  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.innerHTML = `${ingredient.name}: <span class="ingredient-scaled-value" data-base-quantity="${ingredient.quantity}" data-unit="${ingredient.unit || ""}"></span>`;
    ingredientsList.appendChild(li);
  });

  const stepsTitle = document.createElement("h3");
  stepsTitle.textContent = "Étapes";
  const stepsList = document.createElement("ol");

  recipe.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });

  refs.recipeDetail.append(header, servingsLabel, ingredientsTitle, ingredientsList, stepsTitle, stepsList);
  updateScaledIngredientQuantities(recipe);

  if (recipe.drinks.length > 0) {
    const drinksTitle = document.createElement("h3");
    drinksTitle.textContent = "Boissons conseillées";
    const drinksList = document.createElement("ul");

    recipe.drinks.forEach((drink) => {
      const li = document.createElement("li");
      li.textContent = drink;
      drinksList.appendChild(li);
    });

    refs.recipeDetail.append(drinksTitle, drinksList);
  }

  const actionButtons = document.createElement("div");
  actionButtons.className = "action-buttons";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-primary";
  editBtn.textContent = "Éditer";
  editBtn.addEventListener("click", () => openEditRecipeDialog(recipe.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger";
  deleteBtn.textContent = "Supprimer";
  deleteBtn.addEventListener("click", () => {
    if (confirm(`Supprimer la recette '${recipe.name}' ?`)) {
      deleteRecipe(recipe.id);
    }
  });

  actionButtons.appendChild(editBtn);
  actionButtons.appendChild(deleteBtn);
  refs.recipeDetail.appendChild(actionButtons);
}

function renderAll() {
  renderRecipeList();
  renderRecipeDetail();
}

function createIngredientRow(data = { name: "", quantity: "", unit: "" }) {
  const fragment = refs.ingredientRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".ingredient-row");
  const nameInput = row.querySelector(".ingredient-name");
  const quantityInput = row.querySelector(".ingredient-quantity");
  const unitInput = row.querySelector(".ingredient-unit");
  const removeBtn = row.querySelector(".remove-ingredient-btn");

  nameInput.value = data.name;
  quantityInput.value = data.quantity;
  unitInput.value = data.unit;

  removeBtn.addEventListener("click", () => {
    row.remove();
  });

  refs.ingredientsRows.appendChild(row);
}

function resetRecipeForm() {
  refs.addRecipeForm.reset();
  refs.ingredientsRows.innerHTML = "";
  createIngredientRow();
}

function openAddRecipeDialog() {
  state.editingRecipeId = null;
  resetRecipeForm();
  refs.addRecipeDialog.querySelector("h2").textContent = "Nouvelle recette";
  refs.addRecipeDialog.showModal();
}

function openEditRecipeDialog(recipeId) {
  const recipe = state.recipes.find((r) => r.id === recipeId);
  if (!recipe) {
    return;
  }

  state.editingRecipeId = recipeId;
  refs.addRecipeDialog.querySelector("h2").textContent = "Éditer la recette";
  
  refs.addRecipeForm.name.value = recipe.name;
  refs.addRecipeForm.category.value = recipe.category;
  refs.addRecipeForm.steps.value = recipe.steps.join("\n");
  refs.addRecipeForm.drinks.value = recipe.drinks.join("\n");
  
  refs.ingredientsRows.innerHTML = "";
  recipe.ingredients.forEach((ingredient) => {
    createIngredientRow(ingredient);
  });
  
  refs.addRecipeDialog.showModal();
}

function closeAddRecipeDialog() {
  refs.addRecipeDialog.close();
}

function handleAddRecipeSubmit(event) {
  event.preventDefault();

  const formData = new FormData(refs.addRecipeForm);
  const ingredients = Array.from(refs.ingredientsRows.querySelectorAll(".ingredient-row"))
    .map((row) => {
      const name = row.querySelector(".ingredient-name").value.trim();
      const quantity = Number(row.querySelector(".ingredient-quantity").value);
      const unit = row.querySelector(".ingredient-unit").value.trim();

      if (!name) {
        return null;
      }

      return {
        name,
        quantity: Number.isNaN(quantity) ? 0 : quantity,
        unit
      };
    })
    .filter(Boolean);

  if (ingredients.length === 0) {
    setStatus("Ajoute au moins un ingrédient.", true);
    return;
  }

  const steps = String(formData.get("steps") || "")
    .split("\n")
    .map((step) => step.trim())
    .filter(Boolean);

  if (steps.length === 0) {
    setStatus("Ajoute au moins une étape.", true);
    return;
  }

  const drinks = String(formData.get("drinks") || "")
    .split("\n")
    .map((drink) => drink.trim())
    .filter(Boolean);

  const recipe = {
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "Plat").trim(),
    baseServings: BASE_SERVINGS,
    ingredients,
    steps,
    drinks
  };

  if (!recipe.name) {
    setStatus("Le nom de la recette est obligatoire.", true);
    return;
  } // no accent needed

  if (state.editingRecipeId) {
    const recipeIndex = state.recipes.findIndex((r) => r.id === state.editingRecipeId);
    if (recipeIndex !== -1) {
      state.recipes[recipeIndex] = { ...state.recipes[recipeIndex], ...recipe };
      setStatus(`Recette "${recipe.name}" modifiée.`);
    }
  } else {
    const newRecipe = {
      id: `recipe-${Date.now()}`,
      ...recipe
    };
    state.recipes.push(newRecipe);
    state.selectedRecipeId = newRecipe.id;
    setStatus(`Recette "${recipe.name}" ajoutée.`);
  }

  state.editingRecipeId = null;
  state.targetServings = BASE_SERVINGS;
  closeAddRecipeDialog();
  renderAll();
}

function deleteRecipe(recipeId) {
  const index = state.recipes.findIndex((r) => r.id === recipeId);
  if (index === -1) {
    return;
  }

  const recipeName = state.recipes[index].name;
  state.recipes.splice(index, 1);
  
  if (state.selectedRecipeId === recipeId) {
    state.selectedRecipeId = state.recipes.length > 0 ? state.recipes[0].id : null;
    state.targetServings = BASE_SERVINGS;
  }

  renderAll();
  setStatus(`Recette "${recipeName}" supprimée.`);
}

function exportRecipes() {
  const serializable = state.recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    baseServings: recipe.baseServings,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    drinks: recipe.drinks
  }));

  const json = JSON.stringify(serializable, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "recettes.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setStatus("Export terminé : recettes.json.");
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
      setStatus(`${state.recipes.length} recette(s) chargée(s) depuis recettes.json.`);
    }
  } catch (error) {
    if (showStatus) {
      setStatus(`Chargement impossible : ${error.message}.`, true);
    }
  }
}

async function importRecipesFromFile(file) {
  if (!file) {
    return;
  }

  try {
    const rawContent = await file.text();
    const data = JSON.parse(rawContent);
    state.recipes = normalizeRecipes(data);

    if (state.recipes.length > 0) {
      state.selectedRecipeId = state.recipes[0].id;
      state.targetServings = state.recipes[0].baseServings || BASE_SERVINGS;
    } else {
      state.selectedRecipeId = null;
      state.targetServings = BASE_SERVINGS;
    }

    renderAll();
    setStatus(`${state.recipes.length} recette(s) importée(s) depuis ${file.name}.`);
  } catch (error) {
    setStatus(`Import impossible : ${error.message}.`, true);
  }
}

function bindEvents() {
  refs.openAddRecipeBtn.addEventListener("click", openAddRecipeDialog);
  refs.cancelAddRecipeBtn.addEventListener("click", closeAddRecipeDialog);
  refs.addIngredientRowBtn.addEventListener("click", () => createIngredientRow());
  refs.addRecipeForm.addEventListener("submit", handleAddRecipeSubmit);
  refs.exportBtn.addEventListener("click", exportRecipes);
  refs.importBtn.addEventListener("click", () => refs.importFileInput.click());
  refs.importFileInput.addEventListener("change", async () => {
    const selectedFile = refs.importFileInput.files && refs.importFileInput.files[0];
    await importRecipesFromFile(selectedFile);
    refs.importFileInput.value = "";
  });

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
  resetRecipeForm();
  renderAll();
  loadRecipesFromRoot(false);
}

init();
