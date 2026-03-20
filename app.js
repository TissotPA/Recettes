const BASE_SERVINGS = 4;
const GITHUB_OWNER = "TissotPA";
const GITHUB_REPO = "Recettes";
const GITHUB_BRANCH = "kcal";
const GITHUB_FILE = "recettes.json";
const GITHUB_ALIMENTS_FILE = "aliments.json";
const PAT_STORAGE_KEY = "gh_pat";

const CATEGORY_ORDER = ["entree", "plat", "dessert"];
const CATEGORY_LABELS = {
  entree: "Entrées",
  plat: "Plats",
  dessert: "Desserts"
};

const PRESET_MULTI_MEASURES = {
  tomate: [{ label: "1 tomate moyenne", quantity: 1, unit: "pièce", kcal: 22 }],
  oignon: [{ label: "1 oignon moyen", quantity: 1, unit: "pièce", kcal: 44 }],
  carotte: [{ label: "1 carotte moyenne", quantity: 1, unit: "pièce", kcal: 25 }],
  concombre: [{ label: "1 concombre", quantity: 1, unit: "pièce", kcal: 48 }],
  courgette: [{ label: "1 courgette moyenne", quantity: 1, unit: "pièce", kcal: 36 }],
  aubergine: [{ label: "1 aubergine moyenne", quantity: 1, unit: "pièce", kcal: 75 }],
  "poivron rouge": [{ label: "1 poivron", quantity: 1, unit: "pièce", kcal: 46 }],
  "poivron vert": [{ label: "1 poivron", quantity: 1, unit: "pièce", kcal: 36 }],
  pomme: [{ label: "1 pomme moyenne", quantity: 1, unit: "pièce", kcal: 78 }],
  poire: [{ label: "1 poire moyenne", quantity: 1, unit: "pièce", kcal: 97 }],
  orange: [{ label: "1 orange", quantity: 1, unit: "pièce", kcal: 61 }],
  fraise: [{ label: "10 fraises", quantity: 10, unit: "pièce", kcal: 45 }],
  beurre: [{ label: "1 noix", quantity: 10, unit: "g", kcal: 72 }],
  "huile d'olive": [
    { label: "1 cuillère à soupe", quantity: 1, unit: "cuillère à soupe", kcal: 119 },
    { label: "1 cuillère à café", quantity: 1, unit: "cuillère à café", kcal: 40 }
  ],
  "huile de tournesol": [
    { label: "1 cuillère à soupe", quantity: 1, unit: "cuillère à soupe", kcal: 119 },
    { label: "1 cuillère à café", quantity: 1, unit: "cuillère à café", kcal: 40 }
  ],
  "sucre blanc": [
    { label: "1 cuillère à café", quantity: 1, unit: "cuillère à café", kcal: 16 },
    { label: "1 cuillère à soupe", quantity: 1, unit: "cuillère à soupe", kcal: 48 }
  ],
  "farine blanche": [{ label: "1 cuillère à soupe", quantity: 1, unit: "cuillère à soupe", kcal: 36 }],
  "lait entier": [{ label: "1 verre", quantity: 1, unit: "verre", kcal: 128 }],
  "lait écrémé": [{ label: "1 verre", quantity: 1, unit: "verre", kcal: 72 }],
  "crème fraîche": [{ label: "1 cuillère à soupe", quantity: 1, unit: "cuillère à soupe", kcal: 51 }],
  parmesan: [{ label: "1 cuillère à soupe", quantity: 1, unit: "cuillère à soupe", kcal: 20 }]
};

const DRINK_KEYWORDS = [
  "eau", "jus", "soda", "cola", "limonade", "the", "thé", "cafe", "café", "lait", "smoothie",
  "sirop", "biere", "bière", "vin", "cocktail", "boisson", "nectar", "infusion", "chocolat chaud"
];

const DRINK_UNITS = ["ml", "cl", "l", "verre", "tasse"];

let lastQuickAlimentCallback = null;

const state = {
  recipes: [],
  selectedRecipeId: null,
  editingRecipeId: null,
  filters: {
    name: "",
    includeIngredients: [],
    fridgeIngredients: []
  },
  targetServings: BASE_SERVINGS,
  aliments: [],
  alimentSearchFilter: "",
  currentTab: "recipes",
  dayEntries: [],
  dayDrinkEntries: [],
  waterGlasses: 0,
  menuSelection: {
    entreeId: "",
    platId: "",
    dessertId: "",
    drinkEntries: []
  },
  coursesEntries: []
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
  patConfirmBtn: document.getElementById("patConfirmBtn"),
  // KCAL Tab
  recipesTab: document.getElementById("recipesTab"),
  kcalTab: document.getElementById("kcalTab"),
  dayTab: document.getElementById("dayTab"),
  menuTab: document.getElementById("menuTab"),
  tabBtns: document.querySelectorAll(".tab-btn"),
  addAlimentBtn: document.getElementById("addAlimentBtn"),
  searchAliment: document.getElementById("searchAliment"),
  alimentList: document.getElementById("alimentList"),
  addAlimentDialog: document.getElementById("addAlimentDialog"),
  addAlimentForm: document.getElementById("addAlimentForm"),
  cancelAddAlimentBtn: document.getElementById("cancelAddAlimentBtn"),
  addAlimentDialogTitle: document.getElementById("addAlimentDialogTitle"),
  submitAddAlimentBtn: document.getElementById("submitAddAlimentBtn"),
  addAlimentMeasureBtn: document.getElementById("addAlimentMeasureBtn"),
  alimentMeasureRows: document.getElementById("alimentMeasureRows"),
  alimentMeasureRowTemplate: document.getElementById("alimentMeasureRowTemplate"),
  // Day tab
  dayRecipeSelect: document.getElementById("dayRecipeSelect"),
  dayServingsInput: document.getElementById("dayServingsInput"),
  addDayEntryBtn: document.getElementById("addDayEntryBtn"),
  dayEntriesList: document.getElementById("dayEntriesList"),
  dayTotalKcal: document.getElementById("dayTotalKcal"),
  dayDrinksKcal: document.getElementById("dayDrinksKcal"),
  dayDrinkSearch: document.getElementById("dayDrinkSearch"),
  dayDrinkDropdown: document.getElementById("dayDrinkDropdown"),
  dayDrinkAlimentId: document.getElementById("dayDrinkAlimentId"),
  dayDrinkMeasureSelect: document.getElementById("dayDrinkMeasureSelect"),
  dayDrinkQuantityInput: document.getElementById("dayDrinkQuantityInput"),
  addDayDrinkBtn: document.getElementById("addDayDrinkBtn"),
  dayDrinksList: document.getElementById("dayDrinksList"),
  waterCount: document.getElementById("waterCount"),
  addWaterBtn: document.getElementById("addWaterBtn"),
  removeWaterBtn: document.getElementById("removeWaterBtn"),
  resetWaterBtn: document.getElementById("resetWaterBtn"),
  // Menu tab
  menuEntreeSelect: document.getElementById("menuEntreeSelect"),
  menuPlatSelect: document.getElementById("menuPlatSelect"),
  menuDessertSelect: document.getElementById("menuDessertSelect"),
  menuDrinkSearch: document.getElementById("menuDrinkSearch"),
  menuDrinkDropdown: document.getElementById("menuDrinkDropdown"),
  menuDrinkAlimentId: document.getElementById("menuDrinkAlimentId"),
  menuDrinkMeasureSelect: document.getElementById("menuDrinkMeasureSelect"),
  menuDrinkQuantityInput: document.getElementById("menuDrinkQuantityInput"),
  addMenuDrinkBtn: document.getElementById("addMenuDrinkBtn"),
  menuDrinksList: document.getElementById("menuDrinksList"),
  menuPreview: document.getElementById("menuPreview"),
  menuTotalKcal: document.getElementById("menuTotalKcal"),
  // Courses tab
  coursesTab: document.getElementById("coursesTab"),
  coursesRecipeSelect: document.getElementById("coursesRecipeSelect"),
  coursesServingsInput: document.getElementById("coursesServingsInput"),
  addCoursesEntryBtn: document.getElementById("addCoursesEntryBtn"),
  coursesRecipesList: document.getElementById("coursesRecipesList"),
  clearCoursesBtn: document.getElementById("clearCoursesBtn"),
  printShoppingListBtn: document.getElementById("printShoppingListBtn"),
  shoppingList: document.getElementById("shoppingList"),
  // Quick add aliment (from recipe ingredient search)
  quickAddAlimentDialog: document.getElementById("quickAddAlimentDialog"),
  quickAddAlimentForm: document.getElementById("quickAddAlimentForm"),
  cancelQuickAddAlimentBtn: document.getElementById("cancelQuickAddAlimentBtn")
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

function normalizeLookupKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildMeasureLabel(quantity, unit) {
  return `${formatQuantity(quantity)} ${unit}`.trim();
}

function createMeasureId(alimentId, measure, index) {
  const labelPart = normalizeLookupKey(measure.label || `${measure.quantity}-${measure.unit}`)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${alimentId}-measure-${labelPart || index + 1}`;
}

function normalizeMeasure(measure, alimentId, index) {
  const quantity = Number(measure.quantity);
  const kcal = Number(measure.kcal);
  const unit = String(measure.unit || "").trim();
  const label = String(measure.label || buildMeasureLabel(quantity, unit)).trim();

  if (!label || !unit || Number.isNaN(quantity) || quantity <= 0 || Number.isNaN(kcal) || kcal < 0) {
    return null;
  }

  return {
    id: measure.id ? String(measure.id).trim() : createMeasureId(alimentId, { label, quantity, unit }, index),
    label,
    quantity,
    unit,
    kcal
  };
}

function getPresetMeasuresForAliment(name) {
  return PRESET_MULTI_MEASURES[normalizeLookupKey(name)] || [];
}

function inferIsDrink(name, measures = []) {
  const normalizedName = normalizeLookupKey(name);
  const byName = DRINK_KEYWORDS.some((keyword) => normalizedName.includes(normalizeLookupKey(keyword)));
  const byUnit = measures.some((measure) => DRINK_UNITS.includes(normalizeLookupKey(measure.unit)));
  return byName || byUnit;
}

function getDefaultMeasure(aliment) {
  return Array.isArray(aliment.measures) && aliment.measures.length > 0
    ? aliment.measures[0]
    : null;
}

function getMeasureById(aliment, measureId) {
  return Array.isArray(aliment.measures)
    ? aliment.measures.find((measure) => measure.id === measureId) || getDefaultMeasure(aliment)
    : null;
}

function findAlimentByName(name) {
  const target = normalizeLookupKey(name);
  const singularTarget = target.endsWith("s") ? target.slice(0, -1) : target;

  return state.aliments.find((aliment) => {
    const alimentName = normalizeLookupKey(aliment.name);
    const singularAlimentName = alimentName.endsWith("s") ? alimentName.slice(0, -1) : alimentName;
    return alimentName === target || singularAlimentName === singularTarget;
  }) || null;
}

function normalizeAliment(aliment, index) {
  if (!aliment || !aliment.name) {
    return null;
  }

  const alimentId = String(aliment.id || `aliment-${Date.now()}-${index}`).trim();
  const baseMeasures = Array.isArray(aliment.measures) && aliment.measures.length > 0
    ? aliment.measures
    : [{
        label: buildMeasureLabel(Number(aliment.quantity) || 100, String(aliment.unit || "g").trim() || "g"),
        quantity: Number(aliment.quantity) || 100,
        unit: String(aliment.unit || "g").trim() || "g",
        kcal: Number(aliment.kcal) || 0
      }];

  const normalizedMeasures = baseMeasures
    .map((measure, measureIndex) => normalizeMeasure(measure, alimentId, measureIndex))
    .filter(Boolean);

  const presetMeasures = getPresetMeasuresForAliment(aliment.name)
    .map((measure, measureIndex) => normalizeMeasure(measure, alimentId, normalizedMeasures.length + measureIndex))
    .filter(Boolean);

  presetMeasures.forEach((presetMeasure) => {
    const exists = normalizedMeasures.some((measure) => normalizeLookupKey(measure.label) === normalizeLookupKey(presetMeasure.label));
    if (!exists) {
      normalizedMeasures.push(presetMeasure);
    }
  });

  if (normalizedMeasures.length === 0) {
    return null;
  }

  const defaultMeasure = normalizedMeasures[0];

  return {
    id: alimentId,
    name: String(aliment.name).trim(),
    measures: normalizedMeasures,
    isDrink: typeof aliment.isDrink === "boolean" ? aliment.isDrink : inferIsDrink(aliment.name, normalizedMeasures),
    kcal: defaultMeasure.kcal,
    quantity: defaultMeasure.quantity,
    unit: defaultMeasure.unit
  };
}

function normalizeAliments(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((aliment, index) => normalizeAliment(aliment, index))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
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
                alimentId: ingredient.alimentId ? String(ingredient.alimentId).trim() : "",
                measureId: ingredient.measureId ? String(ingredient.measureId).trim() : "",
                measureLabel: ingredient.measureLabel ? String(ingredient.measureLabel).trim() : "",
                quantity: Number(ingredient.quantity) || 0,
                unit: ingredient.unit ? String(ingredient.unit).trim() : "",
                kcal: Number(ingredient.kcal) || 0,
                name: String(ingredient.name).trim()
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

function getRecipeKcalPerPerson(recipe) {
  const baseServings = recipe.baseServings || BASE_SERVINGS;
  const totalKcal = (recipe.ingredients || []).reduce((sum, ingredient) => sum + (ingredient.kcal || 0), 0);
  return totalKcal / baseServings;
}

function getRecipeById(recipeId) {
  return state.recipes.find((recipe) => recipe.id === recipeId) || null;
}

function getAlimentById(alimentId) {
  return state.aliments.find((aliment) => aliment.id === alimentId) || null;
}

function getDrinkAliments() {
  return state.aliments.filter((aliment) => aliment.isDrink);
}

function getDrinkMatches(searchTerm) {
  const normalizedTerm = normalizeLookupKey(searchTerm);
  if (!normalizedTerm) {
    return [];
  }

  return getDrinkAliments()
    .filter((aliment) => normalizeLookupKey(aliment.name).includes(normalizedTerm))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function fillSelectWithRecipes(select, recipes, placeholder) {
  if (!select) {
    return;
  }

  const previousValue = select.value;
  select.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.appendChild(placeholderOption);

  recipes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .forEach((recipe) => {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = recipe.name;
      select.appendChild(option);
    });

  if (previousValue && recipes.some((recipe) => recipe.id === previousValue)) {
    select.value = previousValue;
  }
}

function renderDayRecipeOptions() {
  fillSelectWithRecipes(refs.dayRecipeSelect, state.recipes, "Sélectionner une recette");

  const selectedDrinkId = refs.dayDrinkAlimentId.value;
  if (selectedDrinkId) {
    const selectedDrink = getDrinkAliments().find((aliment) => aliment.id === selectedDrinkId);
    if (selectedDrink) {
      refs.dayDrinkSearch.value = selectedDrink.name;
    } else {
      refs.dayDrinkAlimentId.value = "";
      refs.dayDrinkSearch.value = "";
    }
  }

  updateDayDrinkMeasureOptions();
}

function updateDayDrinkMeasureOptions() {
  const drinkId = refs.dayDrinkAlimentId.value;
  refs.dayDrinkMeasureSelect.innerHTML = '<option value="">Choisir une mesure</option>';

  if (!drinkId) {
    return;
  }

  const aliment = getAlimentById(drinkId);
  if (!aliment) {
    return;
  }

  aliment.measures.forEach((measure) => {
    const option = document.createElement("option");
    option.value = measure.id;
    option.textContent = `${measure.label} • ${measure.kcal} kcal`;
    refs.dayDrinkMeasureSelect.appendChild(option);
  });

  if (aliment.measures.length > 0) {
    refs.dayDrinkMeasureSelect.value = aliment.measures[0].id;
  }
}

function bindDrinkSearch(inputEl, dropdownEl, hiddenIdEl, onSelect) {
  if (!inputEl || !dropdownEl || !hiddenIdEl) {
    return;
  }

  inputEl.addEventListener("input", (event) => {
    const rawSearch = event.target.value.trim();
    hiddenIdEl.value = "";
    onSelect(null);

    if (!rawSearch) {
      dropdownEl.style.display = "none";
      return;
    }

    const matches = getDrinkMatches(rawSearch);
    dropdownEl.innerHTML = "";

    if (matches.length === 0) {
      dropdownEl.innerHTML = '<div style="padding: 0.5rem 0.6rem; color: var(--muted); font-size: 0.9rem;">Aucune boisson trouvée. Tagge un aliment en "boisson" dans l\'onglet KCAL.</div>';
    } else {
      matches.forEach((aliment) => {
        const option = document.createElement("div");
        option.className = "ingredient-option";
        const defaultMeasure = getDefaultMeasure(aliment);
        option.textContent = defaultMeasure
          ? `${aliment.name} (${defaultMeasure.label}, ${defaultMeasure.kcal} kcal)`
          : aliment.name;

        option.addEventListener("click", () => {
          inputEl.value = aliment.name;
          hiddenIdEl.value = aliment.id;
          onSelect(aliment);
          dropdownEl.style.display = "none";
        });

        dropdownEl.appendChild(option);
      });
    }

    dropdownEl.style.display = "block";
  });

  inputEl.addEventListener("blur", () => {
    setTimeout(() => {
      dropdownEl.style.display = "none";
    }, 200);
  });
}

function addDayDrinkEntry() {
  const alimentId = refs.dayDrinkAlimentId.value;
  const measureId = refs.dayDrinkMeasureSelect.value;
  const quantity = Number(refs.dayDrinkQuantityInput.value);

  if (!alimentId || !measureId) {
    setStatus("Sélectionne une boisson et une mesure.", true);
    return;
  }

  if (Number.isNaN(quantity) || quantity <= 0) {
    setStatus("La quantité de boisson doit être supérieure à 0.", true);
    return;
  }

  const aliment = getAlimentById(alimentId);
  const measure = aliment ? getMeasureById(aliment, measureId) : null;

  if (!aliment || !measure) {
    setStatus("Boisson introuvable.", true);
    return;
  }

  const kcal = (quantity / measure.quantity) * measure.kcal;

  state.dayDrinkEntries.push({
    id: `day-drink-${Date.now()}`,
    alimentId,
    measureId,
    quantity,
    kcal: Math.round(kcal)
  });

  renderDayEntries();
}

function removeDayDrinkEntry(entryId) {
  const index = state.dayDrinkEntries.findIndex((entry) => entry.id === entryId);
  if (index === -1) {
    return;
  }

  state.dayDrinkEntries.splice(index, 1);
  renderDayEntries();
}

function addDayEntry() {
  const recipeId = refs.dayRecipeSelect.value;
  const portions = Number(refs.dayServingsInput.value);

  if (!recipeId) {
    setStatus("Sélectionne une recette pour l'ajouter à la journée.", true);
    return;
  }

  if (Number.isNaN(portions) || portions <= 0) {
    setStatus("Le nombre de portions doit être supérieur à 0.", true);
    return;
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    setStatus("Recette introuvable.", true);
    return;
  }

  state.dayEntries.push({
    id: `day-entry-${Date.now()}`,
    recipeId,
    servings: portions
  });

  renderDayEntries();
  setStatus(`"${recipe.name}" ajouté à la journée.`);
}

function removeDayEntry(entryId) {
  const index = state.dayEntries.findIndex((entry) => entry.id === entryId);
  if (index === -1) {
    return;
  }

  state.dayEntries.splice(index, 1);
  renderDayEntries();
}

function renderDayEntries() {
  if (!refs.dayEntriesList || !refs.dayTotalKcal || !refs.waterCount || !refs.dayDrinksList || !refs.dayDrinksKcal) {
    return;
  }

  refs.dayEntriesList.innerHTML = "";
  refs.dayDrinksList.innerHTML = "";

  if (state.dayEntries.length === 0) {
    refs.dayEntriesList.innerHTML = '<p class="empty-state">Aucune recette ajoutée pour la journée.</p>';
  }

  let totalKcal = 0;
  let drinksKcal = 0;

  state.dayEntries.forEach((entry) => {
    const recipe = getRecipeById(entry.recipeId);
    if (!recipe) {
      return;
    }

    const recipeKcal = getRecipeKcalPerPerson(recipe) * entry.servings;
    totalKcal += recipeKcal;

    const row = document.createElement("div");
    row.className = "day-entry-row";
    row.innerHTML = `
      <div>
        <strong>${recipe.name}</strong>
        <div class="day-entry-meta">${formatQuantity(entry.servings)} portion(s) • ${Math.round(recipeKcal)} kcal</div>
      </div>
      <button class="btn btn-small btn-danger" type="button">Retirer</button>
    `;

    row.querySelector("button").addEventListener("click", () => removeDayEntry(entry.id));
    refs.dayEntriesList.appendChild(row);
  });

  if (state.dayDrinkEntries.length === 0) {
    refs.dayDrinksList.innerHTML = '<p class="empty-state">Aucune boisson ajoutée.</p>';
  }

  state.dayDrinkEntries.forEach((entry) => {
    const aliment = getAlimentById(entry.alimentId);
    const measure = aliment ? getMeasureById(aliment, entry.measureId) : null;
    if (!aliment || !measure) {
      return;
    }

    const kcal = Number(entry.kcal) || 0;
    drinksKcal += kcal;

    const row = document.createElement("div");
    row.className = "day-entry-row";
    row.innerHTML = `
      <div>
        <strong>${aliment.name}</strong>
        <div class="day-entry-meta">${formatQuantity(entry.quantity)} × ${measure.label} • ${Math.round(kcal)} kcal</div>
      </div>
      <button class="btn btn-small btn-danger" type="button">Retirer</button>
    `;

    row.querySelector("button").addEventListener("click", () => removeDayDrinkEntry(entry.id));
    refs.dayDrinksList.appendChild(row);
  });

  refs.dayDrinksKcal.textContent = `${Math.round(drinksKcal)} kcal`;
  refs.dayTotalKcal.textContent = `${Math.round(totalKcal + drinksKcal)} kcal`;
  refs.waterCount.textContent = String(state.waterGlasses);
}

function updateWaterCount(delta) {
  state.waterGlasses = Math.max(0, state.waterGlasses + delta);
  renderDayEntries();
}

function resetWaterCount() {
  state.waterGlasses = 0;
  renderDayEntries();
}

function renderMenuOptions() {
  const entries = state.recipes.filter((recipe) => normalizeCategoryKey(recipe.category) === "entree");
  const plats = state.recipes.filter((recipe) => normalizeCategoryKey(recipe.category) === "plat");
  const desserts = state.recipes.filter((recipe) => normalizeCategoryKey(recipe.category) === "dessert");

  fillSelectWithRecipes(refs.menuEntreeSelect, entries, "Sélectionner une entrée");
  fillSelectWithRecipes(refs.menuPlatSelect, plats, "Sélectionner un plat");
  fillSelectWithRecipes(refs.menuDessertSelect, desserts, "Sélectionner un dessert");

  const selectedDrinkId = refs.menuDrinkAlimentId.value;
  if (selectedDrinkId) {
    const selectedDrink = getDrinkAliments().find((aliment) => aliment.id === selectedDrinkId);
    if (selectedDrink) {
      refs.menuDrinkSearch.value = selectedDrink.name;
    } else {
      refs.menuDrinkAlimentId.value = "";
      refs.menuDrinkSearch.value = "";
    }
  }

  updateMenuDrinkMeasureOptions();

  refs.menuEntreeSelect.value = state.menuSelection.entreeId;
  refs.menuPlatSelect.value = state.menuSelection.platId;
  refs.menuDessertSelect.value = state.menuSelection.dessertId;
}

function updateMenuSelection() {
  state.menuSelection.entreeId = refs.menuEntreeSelect.value;
  state.menuSelection.platId = refs.menuPlatSelect.value;
  state.menuSelection.dessertId = refs.menuDessertSelect.value;

  renderMenuPreview();
}

function updateMenuDrinkMeasureOptions() {
  const drinkId = refs.menuDrinkAlimentId.value;
  refs.menuDrinkMeasureSelect.innerHTML = '<option value="">Choisir une mesure</option>';

  if (!drinkId) {
    return;
  }

  const aliment = getAlimentById(drinkId);
  if (!aliment) {
    return;
  }

  aliment.measures.forEach((measure) => {
    const option = document.createElement("option");
    option.value = measure.id;
    option.textContent = `${measure.label} • ${measure.kcal} kcal`;
    refs.menuDrinkMeasureSelect.appendChild(option);
  });

  if (aliment.measures.length > 0) {
    refs.menuDrinkMeasureSelect.value = aliment.measures[0].id;
  }
}

function addMenuDrinkEntry() {
  const alimentId = refs.menuDrinkAlimentId.value;
  const measureId = refs.menuDrinkMeasureSelect.value;
  const quantity = Number(refs.menuDrinkQuantityInput.value);

  if (!alimentId || !measureId) {
    setStatus("Sélectionne une boisson et une mesure pour le menu.", true);
    return;
  }

  if (Number.isNaN(quantity) || quantity <= 0) {
    setStatus("La quantité de boisson doit être supérieure à 0.", true);
    return;
  }

  const aliment = getAlimentById(alimentId);
  const measure = aliment ? getMeasureById(aliment, measureId) : null;

  if (!aliment || !measure) {
    setStatus("Boisson du menu introuvable.", true);
    return;
  }

  const kcal = (quantity / measure.quantity) * measure.kcal;

  state.menuSelection.drinkEntries.push({
    id: `menu-drink-${Date.now()}`,
    alimentId,
    measureId,
    quantity,
    kcal: Math.round(kcal)
  });

  renderMenuPreview();
}

function removeMenuDrinkEntry(entryId) {
  const index = state.menuSelection.drinkEntries.findIndex((entry) => entry.id === entryId);
  if (index === -1) {
    return;
  }

  state.menuSelection.drinkEntries.splice(index, 1);
  renderMenuPreview();
}

function renderMenuPreview() {
  if (!refs.menuPreview || !refs.menuTotalKcal || !refs.menuDrinksList) {
    return;
  }

  const entree = getRecipeById(state.menuSelection.entreeId);
  const plat = getRecipeById(state.menuSelection.platId);
  const dessert = getRecipeById(state.menuSelection.dessertId);

  const selectedRecipes = [entree, plat, dessert].filter(Boolean);
  const drinksKcalPerPerson = state.menuSelection.drinkEntries.reduce((sum, entry) => sum + (Number(entry.kcal) || 0), 0);
  const totalKcalPerPerson = selectedRecipes.reduce((sum, recipe) => sum + getRecipeKcalPerPerson(recipe), 0) + drinksKcalPerPerson;

  refs.menuTotalKcal.textContent = `${Math.round(totalKcalPerPerson)} kcal/personne`;

  refs.menuDrinksList.innerHTML = "";

  if (state.menuSelection.drinkEntries.length === 0) {
    refs.menuDrinksList.innerHTML = '<p class="empty-state">Aucune boisson ajoutée.</p>';
  }

  state.menuSelection.drinkEntries.forEach((entry) => {
    const aliment = getAlimentById(entry.alimentId);
    const measure = aliment ? getMeasureById(aliment, entry.measureId) : null;
    if (!aliment || !measure) {
      return;
    }

    const row = document.createElement("div");
    row.className = "day-entry-row";
    row.innerHTML = `
      <div>
        <strong>${aliment.name}</strong>
        <div class="day-entry-meta">${formatQuantity(entry.quantity)} × ${measure.label} • ${Math.round(entry.kcal)} kcal/pers</div>
      </div>
      <button class="btn btn-small btn-danger" type="button">Retirer</button>
    `;

    row.querySelector("button").addEventListener("click", () => removeMenuDrinkEntry(entry.id));
    refs.menuDrinksList.appendChild(row);
  });

  if (!entree && !plat && !dessert && state.menuSelection.drinkEntries.length === 0) {
    refs.menuPreview.className = "menu-preview empty-state";
    refs.menuPreview.textContent = "Sélectionne des recettes pour construire le menu.";
    return;
  }

  refs.menuPreview.className = "menu-preview";

  const drinksItems = state.menuSelection.drinkEntries.length > 0
    ? state.menuSelection.drinkEntries
        .map((entry) => {
          const aliment = getAlimentById(entry.alimentId);
          const measure = aliment ? getMeasureById(aliment, entry.measureId) : null;
          if (!aliment || !measure) {
            return "";
          }
          return `<li>${aliment.name} (${formatQuantity(entry.quantity)} × ${measure.label}) • ${Math.round(entry.kcal)} kcal/pers</li>`;
        })
        .join("")
    : "<li>Aucune boisson définie</li>";

  refs.menuPreview.innerHTML = `
    <ul>
      <li><strong>Entrée:</strong> ${entree ? entree.name : "-"}</li>
      <li><strong>Plat:</strong> ${plat ? plat.name : "-"}</li>
      <li><strong>Dessert:</strong> ${dessert ? dessert.name : "-"}</li>
      <li><strong>Boissons:</strong>
        <ul>${drinksItems}</ul>
      </li>
    </ul>
  `;
}

// ── Courses tab ──────────────────────────────────────────────────────────────

function renderCoursesRecipeOptions() {
  fillSelectWithRecipes(refs.coursesRecipeSelect, state.recipes, "Sélectionner une recette");
}

function addCoursesEntry() {
  const recipeId = refs.coursesRecipeSelect.value;
  const servings = Number(refs.coursesServingsInput.value);

  if (!recipeId) {
    setStatus("Sélectionne une recette pour la liste de courses.", true);
    return;
  }

  if (Number.isNaN(servings) || servings <= 0) {
    setStatus("Le nombre de personnes doit être supérieur à 0.", true);
    return;
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    setStatus("Recette introuvable.", true);
    return;
  }

  state.coursesEntries.push({
    id: `courses-${Date.now()}`,
    recipeId,
    servings
  });

  renderCoursesTab();
  setStatus(`"${recipe.name}" ajoutée à la liste de courses.`);
}

function removeCoursesEntry(entryId) {
  const index = state.coursesEntries.findIndex((entry) => entry.id === entryId);
  if (index === -1) return;
  state.coursesEntries.splice(index, 1);
  renderCoursesTab();
}

function clearCoursesList() {
  state.coursesEntries = [];
  renderCoursesTab();
}

function buildShoppingList() {
  // Map: "normalizedName|unit" -> { name, unit, totalQuantity }
  const map = new Map();

  state.coursesEntries.forEach((entry) => {
    const recipe = getRecipeById(entry.recipeId);
    if (!recipe) return;

    const scale = entry.servings / (recipe.baseServings || BASE_SERVINGS);

    recipe.ingredients.forEach((ingredient) => {
      const scaledQty = ingredient.quantity * scale;
      const key = `${normalizeLookupKey(ingredient.name)}|${ingredient.unit || ""}`;

      if (map.has(key)) {
        map.get(key).totalQuantity += scaledQty;
      } else {
        map.set(key, {
          name: ingredient.name,
          unit: ingredient.unit || "",
          totalQuantity: scaledQty
        });
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function renderCoursesTab() {
  if (!refs.coursesRecipesList || !refs.shoppingList) return;

  renderCoursesRecipeOptions();

  // Render selected recipes list
  refs.coursesRecipesList.innerHTML = "";

  if (state.coursesEntries.length === 0) {
    refs.coursesRecipesList.innerHTML = '<p class="empty-state">Aucune recette sélectionnée.</p>';
  } else {
    state.coursesEntries.forEach((entry) => {
      const recipe = getRecipeById(entry.recipeId);
      if (!recipe) return;

      const row = document.createElement("div");
      row.className = "day-entry-row";
      row.innerHTML = `
        <div>
          <strong>${recipe.name}</strong>
          <div class="day-entry-meta">${entry.servings} personne(s)</div>
        </div>
        <button class="btn btn-small btn-danger" type="button">Retirer</button>
      `;
      row.querySelector("button").addEventListener("click", () => removeCoursesEntry(entry.id));
      refs.coursesRecipesList.appendChild(row);
    });
  }

  // Render shopping list
  refs.shoppingList.innerHTML = "";

  if (state.coursesEntries.length === 0) {
    refs.shoppingList.innerHTML = '<p class="empty-state">Ajoute des recettes pour générer la liste de courses.</p>';
    return;
  }

  const items = buildShoppingList();

  if (items.length === 0) {
    refs.shoppingList.innerHTML = '<p class="empty-state">Aucun ingrédient trouvé.</p>';
    return;
  }

  const list = document.createElement("ul");
  list.className = "shopping-list";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "shopping-item";
    const unitPart = item.unit ? ` ${item.unit}` : "";
    li.innerHTML = `
      <label>
        <input type="checkbox" />
        <span><strong>${formatQuantity(item.totalQuantity)}${unitPart}</strong> — ${item.name}</span>
      </label>
    `;
    list.appendChild(li);
  });

  refs.shoppingList.appendChild(list);
}

function printShoppingList() {
  const items = buildShoppingList();
  if (items.length === 0) {
    setStatus("La liste de courses est vide.", true);
    return;
  }

  const recipeNames = state.coursesEntries
    .map((e) => {
      const r = getRecipeById(e.recipeId);
      return r ? `${r.name} (${e.servings} pers.)` : "";
    })
    .filter(Boolean)
    .join(", ");

  const lines = items
    .map((item) => {
      const unitPart = item.unit ? ` ${item.unit}` : "";
      return `<li>${formatQuantity(item.totalQuantity)}${unitPart} — ${item.name}</li>`;
    })
    .join("");

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8" /><title>Liste de courses</title>
    <style>
      body { font-family: sans-serif; padding: 2rem; }
      h1 { font-size: 1.4rem; }
      p { color: #555; font-size: 0.9rem; margin-bottom: 1rem; }
      ul { list-style: none; padding: 0; }
      li { padding: 0.3rem 0; border-bottom: 1px solid #eee; }
    </style>
  </head><body>
    <h1>Liste de courses</h1>
    <p>${recipeNames}</p>
    <ul>${lines}</ul>
  </body></html>`);
  win.document.close();
  win.print();
}

function updateScaledIngredientQuantities(recipe) {
  const ingredientsList = refs.recipeDetail.querySelector(".ingredients-list");
  if (!ingredientsList) {
    return;
  }

  const scale = getScaleFactor(recipe);
  const quantityNodes = ingredientsList.querySelectorAll(".ingredient-quantity");
  const kcalNodes = ingredientsList.querySelectorAll(".ingredient-kcal-value");

  quantityNodes.forEach((node) => {
    const baseQuantity = Number(node.dataset.baseQuantity);
    const unit = node.dataset.unit || "";
    const suffix = unit ? ` ${unit}` : "";
    const scaled = (Number.isNaN(baseQuantity) ? 0 : baseQuantity) * scale;
    node.textContent = `${formatQuantity(scaled)}${suffix}`;
  });

  kcalNodes.forEach((node) => {
    const baseKcal = Number(node.dataset.baseKcal);
    const scaledKcal = (Number.isNaN(baseKcal) ? 0 : baseKcal) * scale;
    const perPersonKcal = scaledKcal / state.targetServings;
    node.textContent = `${Math.round(perPersonKcal)} kcal/pers`;
  });

  const perPersonNode = refs.recipeDetail.querySelector("[data-base-total-kcal-person]");

  if (perPersonNode) {
    const baseTotal = Number(perPersonNode.dataset.baseTotalKcal);
    const scaledTotal = (Number.isNaN(baseTotal) ? 0 : baseTotal) * scale;
    perPersonNode.textContent = String(Math.round(scaledTotal / state.targetServings));
  }
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
      <div class="recipe-meta">${recipe.category} • ${recipe.ingredients.length} ingrédient(s)</div>
      ${state.filters.fridgeIngredients.length > 0 ? `<div class="match-note">${recipe._fridgeMatchCount} ingrédient(s) du frigo retrouvé(s)</div>` : ""}
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
    refs.recipeList.innerHTML = '<p class="empty-state">Aucune recette ne correspond à la recherche.</p>';
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
    refs.recipeDetail.textContent = "Sélectionne une recette pour voir le détail.";
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

  const totalKcal = recipe.ingredients.reduce((sum, ingredient) => sum + (ingredient.kcal || 0), 0);

  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    const measureInfo = ingredient.measureLabel ? ` <span class="ingredient-meta">(${ingredient.measureLabel})</span>` : "";
    const kcalInfo = ingredient.kcal
      ? ` <span class="ingredient-kcal ingredient-kcal-value" data-base-kcal="${ingredient.kcal}">${Math.round(ingredient.kcal / (recipe.baseServings || BASE_SERVINGS))} kcal/pers</span>`
      : "";

    li.innerHTML = `${ingredient.name}: <span class="ingredient-quantity" data-base-quantity="${ingredient.quantity}" data-unit="${ingredient.unit || ""}"></span>${measureInfo}${kcalInfo}`;
    ingredientsList.appendChild(li);
  });

  const kcalInfo = document.createElement("div");
  kcalInfo.className = "recipe-kcal-info";
  kcalInfo.innerHTML = `
    <strong>Calories de la recette:</strong>
    <span data-base-total-kcal-person data-base-total-kcal="${totalKcal}">${Math.round(totalKcal / (recipe.baseServings || BASE_SERVINGS))}</span> kcal/personne
  `;

  const stepsTitle = document.createElement("h3");
  stepsTitle.textContent = "Étapes";
  const stepsList = document.createElement("ol");

  recipe.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });

  refs.recipeDetail.append(header, servingsLabel, ingredientsTitle, ingredientsList, kcalInfo, stepsTitle, stepsList);

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
  renderDayRecipeOptions();
  renderDayEntries();
  renderMenuOptions();
  renderMenuPreview();
  renderCoursesTab();
}

function createIngredientRow(data = { name: "", quantity: "", unit: "", alimentId: "", measureId: "", measureLabel: "" }) {
  const fragment = refs.ingredientRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".ingredient-row");
  const searchInput = row.querySelector(".ingredient-search");
  const dropdown = row.querySelector(".ingredient-dropdown");
  const measureSelect = row.querySelector(".ingredient-measure");
  const quantityInput = row.querySelector(".ingredient-quantity");
  const kcalDisplay = row.querySelector(".ingredient-kcal");
  const alimentIdInput = row.querySelector(".ingredient-alimentId");
  const removeBtn = row.querySelector(".remove-ingredient-btn");

  let selectedAliment = null;

  function clearSelectedAliment() {
    selectedAliment = null;
    alimentIdInput.value = "";
    measureSelect.innerHTML = '<option value="">Choisir une mesure</option>';
    measureSelect.value = "";
    quantityInput.placeholder = "Quantité";
    kcalDisplay.textContent = "";
  }

  function getSelectedMeasure() {
    if (!selectedAliment || !measureSelect.value) {
      return null;
    }

    return getMeasureById(selectedAliment, measureSelect.value);
  }

  function populateMeasureOptions(aliment, preferredMeasure = {}) {
    measureSelect.innerHTML = '<option value="">Choisir une mesure</option>';

    aliment.measures.forEach((measure) => {
      const option = document.createElement("option");
      option.value = measure.id;
      option.textContent = `${measure.label} • ${measure.kcal} kcal`;
      measureSelect.appendChild(option);
    });

    const preferred = aliment.measures.find((measure) => measure.id === preferredMeasure.measureId)
      || aliment.measures.find((measure) => normalizeLookupKey(measure.label) === normalizeLookupKey(preferredMeasure.measureLabel))
      || aliment.measures.find((measure) => measure.unit === preferredMeasure.unit)
      || getDefaultMeasure(aliment);

    measureSelect.value = preferred ? preferred.id : "";
  }

  function applySelectedAliment(aliment, preferredMeasure = {}) {
    selectedAliment = aliment;
    searchInput.value = aliment.name;
    alimentIdInput.value = aliment.id;
    populateMeasureOptions(aliment, preferredMeasure);
    updateKcalDisplay();
  }

  quantityInput.value = data.quantity || "";

  function updateKcalDisplay() {
    const selectedMeasure = getSelectedMeasure();

    if (!selectedMeasure || !quantityInput.value) {
      kcalDisplay.textContent = "";
      return;
    }

    const usedQuantity = Number(quantityInput.value);
    if (isNaN(usedQuantity)) {
      kcalDisplay.textContent = "";
      return;
    }

    quantityInput.placeholder = `Quantité (${selectedMeasure.unit})`;

    const kcal = (usedQuantity / selectedMeasure.quantity) * selectedMeasure.kcal;
    kcalDisplay.textContent = `${kcal.toFixed(0)} kcal`;
  }

  searchInput.addEventListener("input", (e) => {
    const rawSearchTerm = e.target.value.trim();
    const searchTerm = rawSearchTerm.toLowerCase();

    clearSelectedAliment();

    if (!searchTerm) {
      dropdown.style.display = "none";
      return;
    }

    const matches = state.aliments.filter((aliment) =>
      aliment.name.toLowerCase().includes(searchTerm)
    );

    dropdown.innerHTML = "";

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 0.5rem 0.6rem; color: var(--muted); font-size: 0.9rem;">
          Aucun aliment trouvé.
          <button class="btn btn-small" type="button" style="margin-top: 0.3rem;">+ Créer "${rawSearchTerm}"</button>
        </div>
      `;

      dropdown.querySelector(".btn").addEventListener("click", (e) => {
        e.preventDefault();
        openAddAlimentQuickDialog(rawSearchTerm, () => {
          searchInput.dispatchEvent(new Event("input"));
        });
      });
    } else {
      matches.forEach((aliment) => {
        const option = document.createElement("div");
        option.className = "ingredient-option";
        const defaultMeasure = getDefaultMeasure(aliment);
        option.textContent = `${aliment.name} (${defaultMeasure.label}, ${defaultMeasure.kcal} kcal)`;

        option.addEventListener("click", () => {
          applySelectedAliment(aliment);
          dropdown.style.display = "none";
        });

        dropdown.appendChild(option);
      });
    }

    dropdown.style.display = "block";
  });

  // Close dropdown when clicking outside
  searchInput.addEventListener("blur", () => {
    // Delay to allow click on dropdown to register
    setTimeout(() => {
      dropdown.style.display = "none";
    }, 200);
  });

  measureSelect.addEventListener("change", updateKcalDisplay);
  quantityInput.addEventListener("input", updateKcalDisplay);

  removeBtn.addEventListener("click", () => {
    row.remove();
  });

  const initialAliment = data.alimentId
    ? state.aliments.find((aliment) => aliment.id === data.alimentId)
    : findAlimentByName(data.name);

  if (initialAliment) {
    applySelectedAliment(initialAliment, data);
  } else if (data.name) {
    searchInput.value = data.name;
  }

  refs.ingredientsRows.appendChild(row);
  updateKcalDisplay();
}

function resetRecipeForm() {
  refs.addRecipeForm.reset();
  refs.ingredientsRows.innerHTML = "";
  createIngredientRow();
}

async function ensureAlimentsLoaded() {
  if (state.aliments.length === 0) {
    await loadAliments();
  }
}

async function openAddRecipeDialog() {
  state.editingRecipeId = null;
  await ensureAlimentsLoaded();
  resetRecipeForm();
  refs.addRecipeDialog.querySelector("h2").textContent = "Nouvelle recette";
  refs.addRecipeDialog.showModal();
}

async function openEditRecipeDialog(recipeId) {
  const recipe = state.recipes.find((r) => r.id === recipeId);
  if (!recipe) {
    return;
  }

  await ensureAlimentsLoaded();
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
  const ingredientRows = Array.from(refs.ingredientsRows.querySelectorAll(".ingredient-row"));

  const hasInvalidIngredient = ingredientRows.some((row) => {
    const searchValue = row.querySelector(".ingredient-search").value.trim();
    const alimentId = row.querySelector(".ingredient-alimentId").value.trim();
    const measureId = row.querySelector(".ingredient-measure").value.trim();
    const quantity = Number(row.querySelector(".ingredient-quantity").value);

    return Boolean(searchValue) && (!alimentId || !measureId || Number.isNaN(quantity) || quantity <= 0);
  });

  if (hasInvalidIngredient) {
    setStatus("Chaque ingrédient doit correspondre à un aliment, une mesure et une quantité valides.", true);
    return;
  }

  const ingredients = Array.from(refs.ingredientsRows.querySelectorAll(".ingredient-row"))
    .map((row) => {
      const alimentId = row.querySelector(".ingredient-alimentId").value.trim();
      const measureId = row.querySelector(".ingredient-measure").value.trim();
      const quantity = Number(row.querySelector(".ingredient-quantity").value);

      if (!alimentId || !measureId || Number.isNaN(quantity) || quantity <= 0) {
        return null;
      }

      const aliment = state.aliments.find((item) => item.id === alimentId);
      if (!aliment) {
        return null;
      }

      const measure = getMeasureById(aliment, measureId);
      if (!measure) {
        return null;
      }

      const kcal = (quantity / measure.quantity) * measure.kcal;

      return {
        alimentId,
        measureId: measure.id,
        measureLabel: measure.label,
        name: aliment.name,
        quantity,
        unit: measure.unit,
        kcal: Math.round(kcal)
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
  }

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
      setStatus(`${state.recipes.length} recette(s) chargée(s) depuis recettes.json.`);
    }
  } catch (error) {
    if (showStatus) {
      setStatus(`Chargement impossible : ${error.message}.`, true);
    }
  }
}

function bindEvents() {
  // Recipe events
  refs.openAddRecipeBtn.addEventListener("click", openAddRecipeDialog);
  refs.cancelAddRecipeBtn.addEventListener("click", closeAddRecipeDialog);
  refs.addIngredientRowBtn.addEventListener("click", () => createIngredientRow());
  refs.addRecipeForm.addEventListener("submit", handleAddRecipeSubmit);
  refs.loadBtn.addEventListener("click", () => {
    if (state.currentTab === "kcal") {
      loadAliments();
    } else {
      loadRecipesFromRoot(true);
    }
  });
  refs.saveBtn.addEventListener("click", async (e) => {
    await saveAllToGitHub(e.shiftKey);
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

  // Tab navigation
  refs.tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });

  // Day events
  refs.addDayEntryBtn.addEventListener("click", addDayEntry);
  bindDrinkSearch(refs.dayDrinkSearch, refs.dayDrinkDropdown, refs.dayDrinkAlimentId, () => {
    refs.dayDrinkMeasureSelect.value = "";
    updateDayDrinkMeasureOptions();
  });
  refs.addDayDrinkBtn.addEventListener("click", addDayDrinkEntry);
  refs.addWaterBtn.addEventListener("click", () => updateWaterCount(1));
  refs.removeWaterBtn.addEventListener("click", () => updateWaterCount(-1));
  refs.resetWaterBtn.addEventListener("click", resetWaterCount);

  // Menu events
  refs.menuEntreeSelect.addEventListener("change", updateMenuSelection);
  refs.menuPlatSelect.addEventListener("change", updateMenuSelection);
  refs.menuDessertSelect.addEventListener("change", updateMenuSelection);
  bindDrinkSearch(refs.menuDrinkSearch, refs.menuDrinkDropdown, refs.menuDrinkAlimentId, () => {
    refs.menuDrinkMeasureSelect.value = "";
    updateMenuDrinkMeasureOptions();
  });
  refs.addMenuDrinkBtn.addEventListener("click", addMenuDrinkEntry);

  // KCAL events
  refs.addAlimentBtn.addEventListener("click", openAddAlimentDialog);
  refs.cancelAddAlimentBtn.addEventListener("click", closeAddAlimentDialog);
  refs.addAlimentMeasureBtn.addEventListener("click", () => createAlimentMeasureRow());
  refs.addAlimentForm.addEventListener("submit", handleAddAlimentSubmit);
  refs.searchAliment.addEventListener("input", () => {
    state.alimentSearchFilter = refs.searchAliment.value.trim().toLowerCase();
    renderAlimentList();
  });

    // Quick add aliment events
    refs.cancelQuickAddAlimentBtn.addEventListener("click", closeAddAlimentQuickDialog);
    refs.quickAddAlimentForm.addEventListener("submit", handleAddAlimentQuickSubmit);

  // Courses events
  refs.addCoursesEntryBtn.addEventListener("click", addCoursesEntry);
  refs.clearCoursesBtn.addEventListener("click", clearCoursesList);
  refs.printShoppingListBtn.addEventListener("click", printShoppingList);
}

function switchTab(tabName) {
  // Update tab buttons
  refs.tabBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  // Show/hide tabs
  const showRecipes = tabName === "recipes";
  const showKcal = tabName === "kcal";
  const showDay = tabName === "day";
  const showMenu = tabName === "menu";
  const showCourses = tabName === "courses";

  refs.recipesTab.classList.toggle("hidden", !showRecipes);
  refs.kcalTab.classList.toggle("hidden", !showKcal);
  refs.dayTab.classList.toggle("hidden", !showDay);
  refs.menuTab.classList.toggle("hidden", !showMenu);
  refs.coursesTab.classList.toggle("hidden", !showCourses);

  // Keep native hidden attribute in sync for environments where CSS may fail/cached stale.
  refs.recipesTab.hidden = !showRecipes;
  refs.kcalTab.hidden = !showKcal;
  refs.dayTab.hidden = !showDay;
  refs.menuTab.hidden = !showMenu;
  refs.coursesTab.hidden = !showCourses;

  state.currentTab = tabName;

  // Load aliments on first KCAL tab visit
  if (tabName === "kcal" && state.aliments.length === 0) {
    loadAliments();
  }
}

async function loadAliments() {
  try {
    const response = await fetch("aliments.json", { cache: "no-store" });
    if (response.status === 404) {
      throw new Error(`Fichier introuvable`);
    }

    const data = await response.json();
    state.aliments = normalizeAliments(Array.isArray(data) ? data : []);
    renderAll();
    renderAlimentList();
    setStatus(`${state.aliments.length} aliment(s) chargé(s).`);
    return state.aliments;
  } catch (error) {
    setStatus(`Chargement des aliments impossible : ${error.message}`, true);
    state.aliments = [];
    return [];
  }
}

function renderAlimentList() {
  refs.alimentList.innerHTML = "";

  const filtered = state.aliments.filter((aliment) => {
    if (!state.alimentSearchFilter) return true;
    return aliment.name.toLowerCase().includes(state.alimentSearchFilter);
  });

  if (filtered.length === 0) {
    refs.alimentList.innerHTML = '<p class="empty-state">Aucun aliment trouvé.</p>';
    return;
  }

  filtered.forEach((aliment) => {
    const row = document.createElement("div");
    row.className = "aliment-row";
    const defaultMeasure = getDefaultMeasure(aliment);
    const displayText = defaultMeasure
      ? `${defaultMeasure.kcal} kcal / ${defaultMeasure.label}`
      : `${aliment.kcal} kcal`;
    const measureSummary = aliment.measures
      .map((measure) => `<span class="aliment-measure-chip">${measure.label}: ${measure.kcal} kcal</span>`)
      .join("");
    
    row.innerHTML = `
      <div class="aliment-name-cell">
        <strong>${aliment.name}</strong> ${aliment.isDrink ? '<span class="badge">Boisson</span>' : ""}
        <div class="aliment-measures-summary">${measureSummary}</div>
      </div>
      <div class="aliment-kcal-cell">${displayText}</div>
      <div class="aliment-actions">
        <button class="aliment-edit-btn" type="button" title="Modifier">✎</button>
        <button class="btn btn-small btn-danger" type="button" title="Supprimer">✕</button>
      </div>
    `;

    const editBtn = row.querySelector(".aliment-edit-btn");
    const deleteBtn = row.querySelector(".btn-danger");

    editBtn.addEventListener("click", () => {
      editAliment(aliment);
    });

    deleteBtn.addEventListener("click", () => {
      if (confirm(`Supprimer "${aliment.name}" ?`)) {
        deleteAliment(aliment.id);
      }
    });

    refs.alimentList.appendChild(row);
  });
}

function createAlimentMeasureRow(data = { label: "", quantity: "", unit: "g", kcal: "" }) {
  const fragment = refs.alimentMeasureRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".aliment-measure-row");
  const labelInput = row.querySelector(".aliment-measure-label");
  const quantityInput = row.querySelector(".aliment-measure-quantity");
  const unitSelect = row.querySelector(".aliment-measure-unit");
  const kcalInput = row.querySelector(".aliment-measure-kcal");
  const removeBtn = row.querySelector(".remove-aliment-measure-btn");

  labelInput.value = data.label || "";
  quantityInput.value = data.quantity || "";
  unitSelect.value = data.unit || "g";
  kcalInput.value = data.kcal || "";

  removeBtn.addEventListener("click", () => {
    row.remove();
  });

  refs.alimentMeasureRows.appendChild(row);
}

function resetAlimentForm(aliment = null) {
  refs.addAlimentForm.reset();
  refs.alimentMeasureRows.innerHTML = "";

  if (aliment) {
    refs.addAlimentDialogTitle.textContent = "Modifier un aliment";
    refs.submitAddAlimentBtn.textContent = "Mettre à jour";
    refs.addAlimentForm.elements.alimentId.value = aliment.id;
    refs.addAlimentForm.elements.name.value = aliment.name;
    refs.addAlimentForm.elements.isDrink.checked = Boolean(aliment.isDrink);
    aliment.measures.forEach((measure) => createAlimentMeasureRow(measure));
  } else {
    refs.addAlimentDialogTitle.textContent = "Ajouter un aliment";
    refs.submitAddAlimentBtn.textContent = "Enregistrer";
    refs.addAlimentForm.elements.alimentId.value = "";
    refs.addAlimentForm.elements.isDrink.checked = false;
    createAlimentMeasureRow({ label: "100 g", quantity: 100, unit: "g", kcal: "" });
  }
}

function collectAlimentMeasures() {
  const rows = Array.from(refs.alimentMeasureRows.querySelectorAll(".aliment-measure-row"));
  const measures = rows.map((row) => ({
    label: row.querySelector(".aliment-measure-label").value.trim(),
    quantity: Number(row.querySelector(".aliment-measure-quantity").value),
    unit: row.querySelector(".aliment-measure-unit").value.trim(),
    kcal: Number(row.querySelector(".aliment-measure-kcal").value)
  }));

  if (measures.length === 0) {
    setStatus("Ajoute au moins une mesure de référence.", true);
    return null;
  }

  const invalidMeasure = measures.find((measure) => !measure.label || !measure.unit || Number.isNaN(measure.quantity) || measure.quantity <= 0 || Number.isNaN(measure.kcal) || measure.kcal < 0);
  if (invalidMeasure) {
    setStatus("Chaque mesure doit avoir un libellé, une quantité, une unité et des kcal valides.", true);
    return null;
  }

  return measures;
}

function openAddAlimentDialog() {
  resetAlimentForm();
  refs.addAlimentDialog.showModal();
}

function closeAddAlimentDialog() {
  refs.addAlimentDialog.close();
}

function handleAddAlimentSubmit(e) {
  e.preventDefault();
  const formData = new FormData(refs.addAlimentForm);

  const alimentId = String(formData.get("alimentId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const isDrink = String(formData.get("isDrink") || "") === "on";
  const measures = collectAlimentMeasures();

  if (!name) {
    setStatus("Le nom de l'aliment est obligatoire.", true);
    return;
  }

  if (!measures) {
    return;
  }

  const normalizedAliment = normalizeAliment({
    id: alimentId || `aliment-${Date.now()}`,
    name,
    isDrink,
    measures
  }, state.aliments.length);

  const existingIndex = alimentId
    ? state.aliments.findIndex((aliment) => aliment.id === alimentId)
    : -1;

  if (existingIndex === -1) {
    state.aliments.push(normalizedAliment);
    setStatus(`Aliment "${name}" ajouté.`);
  } else {
    state.aliments[existingIndex] = normalizedAliment;
    setStatus(`Aliment "${name}" mis à jour.`);
  }

  state.aliments.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  closeAddAlimentDialog();
  renderAll();
  renderAlimentList();
}

function editAliment(aliment) {
  resetAlimentForm(aliment);
  refs.addAlimentDialog.showModal();
}

function deleteAliment(alimentId) {
  const index = state.aliments.findIndex((a) => a.id === alimentId);
  if (index !== -1) {
    const name = state.aliments[index].name;
    state.aliments.splice(index, 1);
    setStatus(`"${name}" supprimé.`);
    renderAll();
    renderAlimentList();
  }
}

async function saveAlimentToGitHub(forcePrompt = false) {
  if (state.aliments.length === 0) {
    setStatus("Aucun aliment à enregistrer.", true);
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

  setStatus("Enregistrement des aliments en cours…");

  try {
    const shaRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_ALIMENTS_FILE}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `Bearer ${pat}`, Accept: "application/vnd.github+json" } }
    );

    if (shaRes.status === 401) {
      clearPat();
      setStatus("Clé invalide. Clique à nouveau sur Enregistrer pour réessayer.", true);
      return;
    }

    if (!shaRes.ok && shaRes.status !== 404) {
      throw new Error(`Lecture impossible (code ${shaRes.status})`);
    }

    let sha = null;
    if (shaRes.ok) {
      const shaData = await shaRes.json();
      sha = shaData.sha;
    }

    const jsonStr = JSON.stringify(state.aliments, null, 2) + "\n";
    const content = btoa(unescape(encodeURIComponent(jsonStr)));
    const now = new Date().toLocaleString("fr-FR");

    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_ALIMENTS_FILE}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `${now} - Modification de aliments.json`,
          content,
          ...(sha && { sha }),
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
      throw new Error(`Erreur GitHub (code ${putRes.status})`);
    }

    storePat(pat);
    setStatus(`${state.aliments.length} aliment(s) enregistré(s) sur GitHub.`);
  } catch (error) {
    setStatus(`Erreur lors de l'enregistrement : ${error.message}`, true);
  }
}

async function githubRequest(path, pat, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    clearPat();
    throw new Error("Clé invalide. Clique à nouveau sur Enregistrer pour réessayer.");
  }

  if (!response.ok) {
    throw new Error(`Erreur GitHub (code ${response.status})`);
  }

  return response;
}

async function saveDataFilesToGitHub(files, pat) {
  const refResponse = await githubRequest(`/git/ref/heads/${GITHUB_BRANCH}`, pat);
  const refData = await refResponse.json();
  const parentCommitSha = refData.object.sha;

  const commitResponse = await githubRequest(`/git/commits/${parentCommitSha}`, pat);
  const commitData = await commitResponse.json();
  const baseTreeSha = commitData.tree.sha;

  const treeEntries = [];

  for (const file of files) {
    const blobResponse = await githubRequest("/git/blobs", pat, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `${JSON.stringify(file.content, null, 2)}\n`,
        encoding: "utf-8"
      })
    });

    const blobData = await blobResponse.json();
    treeEntries.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blobData.sha
    });
  }

  const treeResponse = await githubRequest("/git/trees", pat, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeEntries
    })
  });

  const treeData = await treeResponse.json();
  const now = new Date().toLocaleString("fr-FR");
  const label = files.map((file) => file.path).join(" + ");

  const newCommitResponse = await githubRequest("/git/commits", pat, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `${now} - Modification de ${label}`,
      tree: treeData.sha,
      parents: [parentCommitSha]
    })
  });

  const newCommitData = await newCommitResponse.json();

  await githubRequest(`/git/refs/heads/${GITHUB_BRANCH}`, pat, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sha: newCommitData.sha,
      force: false
    })
  });

  return newCommitData.sha;
}

async function saveAllToGitHub(forcePrompt = false) {
  const hasRecipes = state.recipes.length > 0;
  const hasAliments = state.aliments.length > 0;

  if (!hasRecipes && !hasAliments) {
    setStatus("Aucune donnée à enregistrer.", true);
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

  const files = [];

  if (hasRecipes) {
    files.push({ path: GITHUB_FILE, content: state.recipes });
  }

  if (hasAliments) {
    files.push({ path: GITHUB_ALIMENTS_FILE, content: state.aliments });
  }

  setStatus("Enregistrement en cours…");

  try {
    await saveDataFilesToGitHub(files, pat);
    storePat(pat);

    if (hasRecipes && hasAliments) {
      setStatus(`Recettes (${state.recipes.length}) et aliments (${state.aliments.length}) enregistrés en un seul commit.`);
      return;
    }

    if (hasRecipes) {
      setStatus(`${state.recipes.length} recette(s) enregistrée(s) en un seul commit.`);
      return;
    }

    setStatus(`${state.aliments.length} aliment(s) enregistré(s) en un seul commit.`);
  } catch (error) {
    setStatus(`Erreur : ${error.message}`, true);
  }
}

function init() {
  bindEvents();
  switchTab(state.currentTab);
  resetRecipeForm();
  renderAll();
  loadRecipesFromRoot(false);
}

function openAddAlimentQuickDialog(defaultName = "", onSuccess = null) {
  refs.quickAddAlimentForm.reset();
  refs.quickAddAlimentForm.name.value = defaultName;
  lastQuickAlimentCallback = onSuccess;
  refs.quickAddAlimentDialog.showModal();
}

function closeAddAlimentQuickDialog() {
  if (refs.quickAddAlimentDialog.open) {
    refs.quickAddAlimentDialog.close();
  }
  lastQuickAlimentCallback = null;
}

function handleAddAlimentQuickSubmit(e) {
  e.preventDefault();
  const formData = new FormData(refs.quickAddAlimentForm);

  const name = String(formData.get("name") || "").trim();
  const kcal = Number(formData.get("kcal") || 0);
  const quantity = Number(formData.get("quantity") || 0);
  const unit = String(formData.get("unit") || "").trim();
  const isDrink = String(formData.get("isDrink") || "") === "on";

  if (!name) {
    setStatus("Le nom de l'aliment est obligatoire.", true);
    return;
  }

  if (kcal < 0) {
    setStatus("Les calories ne peuvent pas être négatives.", true);
    return;
  }

  if (quantity <= 0) {
    setStatus("La quantité doit être supérieure à 0.", true);
    return;
  }

  if (!unit) {
    setStatus("L'unité est obligatoire.", true);
    return;
  }

  const newAliment = {
    id: `aliment-${Date.now()}`,
    name,
    isDrink,
    measures: [{
      label: buildMeasureLabel(quantity, unit),
      quantity,
      unit,
      kcal
    }]
  };

  state.aliments.push(normalizeAliment(newAliment, state.aliments.length));
  state.aliments.sort((a, b) => a.name.localeCompare(b.name, "fr"));

  setStatus(`Aliment "${name}" créé.`);
  renderAll();
  if (refs.quickAddAlimentDialog.open) {
    refs.quickAddAlimentDialog.close();
  }

  if (lastQuickAlimentCallback && typeof lastQuickAlimentCallback === "function") {
    const callback = lastQuickAlimentCallback;
    lastQuickAlimentCallback = null;
    callback();
  }
}

init();
