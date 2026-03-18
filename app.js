const BASE_SERVINGS = 4;
const GITHUB_OWNER = "TissotPA";
const GITHUB_REPO = "Recettes";
const GITHUB_BRANCH = "gh-pages";
const GITHUB_FILE = "recettes.json";
const PAT_STORAGE_KEY = "gh_pat";

const CATEGORY_ORDER = ["entree", "plat", "dessert"];
const CATEGORY_LABELS = {
  entree: "Entrées",
  plat: "Plats",
  dessert: "Desserts"
};

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
  loadBtn: document.getElementById("loadBtn"),
  saveBtn: document.getElementById("saveBtn"),
  patDialog: document.getElementById("patDialog"),
  patInput: document.getElementById("patInput"),
  patCancelBtn: document.getElementById("patCancelBtn"),
  patConfirmBtn: document.getElementById("patConfirmBtn")
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
  const quantityNodes = ingredientsList.querySelectorAll(".ingredient-quantity");

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

function normalizeCategoryKey(category) {
  const normalized = String(category || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.startsWith("entree")) {
    return "entree";
  }

  if (normalized.startsWith("dessert")) {
    return "dessert";
  }

  if (normalized.startsWith("plat")) {
    return "plat";
  }

  return normalized || "plat";
}

function getOrderedCategoryKeys(categoryMap) {
  const dynamicKeys = Object.keys(categoryMap).filter((key) => !CATEGORY_ORDER.includes(key));
  dynamicKeys.sort((a, b) => a.localeCompare(b, "fr"));
  return [...CATEGORY_ORDER.filter((key) => categoryMap[key]), ...dynamicKeys];
}

function createRecipeCard(recipe) {
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

  return card;
}

function renderRecipeList() {
  const filtered = getFilteredRecipes();

  refs.recipeList.innerHTML = "";

  if (filtered.length === 0) {
    refs.recipeList.innerHTML = '<p class="empty-state">Aucune recette ne correspond a la recherche.</p>';
    return;
  }

  const categoryMap = {};

  filtered.forEach((recipe) => {
    const key = normalizeCategoryKey(recipe.category);
    if (!categoryMap[key]) {
      categoryMap[key] = [];
    }
    categoryMap[key].push(recipe);
  });

  const orderedKeys = getOrderedCategoryKeys(categoryMap);

  orderedKeys.forEach((key) => {
    const recipes = categoryMap[key].slice().sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const categorySection = document.createElement("details");
    categorySection.className = "recipe-category-group";
    categorySection.open = true;

    const summary = document.createElement("summary");
    const label = CATEGORY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
    summary.textContent = `${label} (${recipes.length})`;
    categorySection.appendChild(summary);

    const groupList = document.createElement("div");
    groupList.className = "recipe-category-list";

    recipes.forEach((recipe) => {
      groupList.appendChild(createRecipeCard(recipe));
    });

    categorySection.appendChild(groupList);
    refs.recipeList.appendChild(categorySection);
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
  ingredientsTitle.textContent = "Ingredients";
  const ingredientsList = document.createElement("ul");
  ingredientsList.className = "ingredients-list";

  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.innerHTML = `${ingredient.name}: <span class="ingredient-quantity" data-base-quantity="${ingredient.quantity}" data-unit="${ingredient.unit || ""}"></span>`;
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

  updateScaledIngredientQuantities(recipe);

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

  const actionButtons = document.createElement("div");
  actionButtons.className = "action-buttons";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-primary";
  editBtn.textContent = "Editer";
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
  refs.addRecipeDialog.querySelector("h2").textContent = "Editer la recette";

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
    setStatus("Ajoute au moins un ingredient.", true);
    return;
  }

  const steps = String(formData.get("steps") || "")
    .split("\n")
    .map((step) => step.trim())
    .filter(Boolean);

  if (steps.length === 0) {
    setStatus("Ajoute au moins une etape.", true);
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
  }

  if (state.editingRecipeId) {
    const recipeIndex = state.recipes.findIndex((r) => r.id === state.editingRecipeId);
    if (recipeIndex !== -1) {
      state.recipes[recipeIndex] = { ...state.recipes[recipeIndex], ...recipe };
      setStatus(`Recette "${recipe.name}" modifiee.`);
    }
  } else {
    const newRecipe = {
      id: `recipe-${Date.now()}`,
      ...recipe
    };
    state.recipes.push(newRecipe);
    state.selectedRecipeId = newRecipe.id;
    setStatus(`Recette "${recipe.name}" ajoutee.`);
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
  setStatus(`Recette "${recipeName}" supprimee.`);
}

function getStoredPat() {
  return localStorage.getItem(PAT_STORAGE_KEY) || "";
}

function storePat(pat) {
  localStorage.setItem(PAT_STORAGE_KEY, pat);
}

function clearPat() {
  localStorage.removeItem(PAT_STORAGE_KEY);
}

function promptPat() {
  return new Promise((resolve, reject) => {
    refs.patInput.value = "";
    refs.patDialog.showModal();
    refs.patInput.focus();

    function onConfirm() {
      const pat = refs.patInput.value.trim();
      cleanup();
      if (pat) {
        resolve(pat);
      } else {
        reject(new Error("Aucune clé saisie."));
      }
    }

    function onCancel() {
      cleanup();
      reject(new Error("Annulé."));
    }

    function onKeydown(e) {
      if (e.key === "Enter") {
        onConfirm();
      } else if (e.key === "Escape") {
        onCancel();
      }
    }

    function cleanup() {
      refs.patConfirmBtn.removeEventListener("click", onConfirm);
      refs.patCancelBtn.removeEventListener("click", onCancel);
      refs.patInput.removeEventListener("keydown", onKeydown);
      refs.patDialog.close();
    }

    refs.patConfirmBtn.addEventListener("click", onConfirm);
    refs.patCancelBtn.addEventListener("click", onCancel);
    refs.patInput.addEventListener("keydown", onKeydown);
  });
}

async function saveRecipesToGitHub(forcePrompt = false) {
  if (state.recipes.length === 0) {
    setStatus("Aucune recette à enregistrer.", true);
    return;
  }

  let pat = forcePrompt ? "" : getStoredPat();

  if (!pat) {
    try {
      pat = await promptPat();
    } catch (err) {
      setStatus(err.message, true);
      return;
    }
  }

  setStatus("Enregistrement en cours…");

  try {
    const shaRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `Bearer ${pat}`, Accept: "application/vnd.github+json" } }
    );

    if (shaRes.status === 401) {
      clearPat();
      setStatus("Clé invalide. Clique à nouveau sur Enregistrer pour réessayer.", true);
      return;
    }

    if (!shaRes.ok) {
      throw new Error(`Lecture impossible (code ${shaRes.status})`);
    }

    const { sha } = await shaRes.json();
    const jsonStr = JSON.stringify(state.recipes, null, 2) + "\n";
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const now = new Date().toLocaleString("fr-FR");

    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `${now} - Modification de recettes.json`,
          content: base64,
          sha,
          branch: GITHUB_BRANCH
        })
      }
    );

    if (putRes.status === 401) {
      clearPat();
      setStatus("Clé invalide. Clique à nouveau sur Enregistrer pour réessayer.", true);
      return;
    }

    if (!putRes.ok) {
      throw new Error(`Échec de l'enregistrement (code ${putRes.status})`);
    }

    storePat(pat);
    setStatus(`${state.recipes.length} recette(s) enregistrée(s) sur GitHub.`);
  } catch (error) {
    setStatus(`Erreur : ${error.message}`, true);
  }
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
  refs.openAddRecipeBtn.addEventListener("click", openAddRecipeDialog);
  refs.cancelAddRecipeBtn.addEventListener("click", closeAddRecipeDialog);
  refs.addIngredientRowBtn.addEventListener("click", () => createIngredientRow());
  refs.addRecipeForm.addEventListener("submit", handleAddRecipeSubmit);
  refs.loadBtn.addEventListener("click", () => loadRecipesFromRoot(true));
  refs.saveBtn.addEventListener("click", (e) => saveRecipesToGitHub(e.shiftKey));

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
