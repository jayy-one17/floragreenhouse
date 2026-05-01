const storageKey = "floragreen-plants-v1";
const cartKey = "floragreen-cart-v1";
const settingsKey = "floragreen-settings-v1";
const ownerPasscode = "floragreen-admin";
const defaultSettings = {
  accountName: "Floragreen House Ltd",
  bankName: "GTBank",
  accountNumber: "0123456789",
  whatsappNumber: ""
};

const abujaLocations = [
  { name: "Central Business District", km: 0 },
  { name: "Wuse", km: 4 },
  { name: "Garki", km: 5 },
  { name: "Maitama", km: 6 },
  { name: "Asokoro", km: 7 },
  { name: "Jabi", km: 9 },
  { name: "Gwarinpa", km: 14 },
  { name: "Lugbe", km: 20 },
  { name: "Kubwa", km: 25 },
  { name: "Karu", km: 27 },
  { name: "Kuje", km: 40 }
];

const starterPlants = [
  {
    id: "plant-hibiscus",
    name: "Red Hibiscus Plant",
    price: 14500,
    category: "Flowering",
    stock: 8,
    image: "",
    tone: "#d84b42",
    leaf: "#1e7d53",
    accent: "#f2ba4f",
    description: "A hardy flowering plant that enjoys Abuja sunlight and regular watering."
  },
  {
    id: "plant-peace-lily",
    name: "Peace Lily Plant",
    price: 18000,
    category: "Indoor",
    stock: 6,
    image: "",
    tone: "#ffffff",
    leaf: "#2f7f5d",
    accent: "#d6b35d",
    description: "A graceful indoor plant with white blooms for shaded rooms and offices."
  },
  {
    id: "plant-croton",
    name: "Croton Plant",
    price: 12500,
    category: "Outdoor",
    stock: 10,
    image: "",
    tone: "#e0a236",
    leaf: "#7b9d35",
    accent: "#c94d3d",
    description: "Bright leaf color for verandas, balconies, and warm outdoor corners."
  },
  {
    id: "plant-anthurium",
    name: "Anthurium Plant",
    price: 22000,
    category: "Flowering",
    stock: 5,
    image: "",
    tone: "#b82242",
    leaf: "#24704d",
    accent: "#e6bf53",
    description: "Glossy leaves and long-lasting red flowers for a premium plant gift."
  },
  {
    id: "plant-snake",
    name: "Snake Plant",
    price: 16000,
    category: "Indoor",
    stock: 12,
    image: "",
    tone: "#8eb14a",
    leaf: "#315d43",
    accent: "#b7d96b",
    description: "Low-maintenance upright plant for homes, shops, and workspaces."
  },
  {
    id: "plant-aloe",
    name: "Aloe Vera Plant",
    price: 9500,
    category: "Succulent",
    stock: 9,
    image: "",
    tone: "#78a84d",
    leaf: "#5f9a61",
    accent: "#e1a95b",
    description: "Compact succulent plant suited to bright windows and easy care."
  }
];

let plants = readPlants();
let cart = readCart();
let settings = readSettings();
let pendingImage = "";
let customSelects = [];
let currentCategory = "all";

const customerApp = document.querySelector("#customerApp");
const ownerApp = document.querySelector("#ownerApp");
const ownerLogin = document.querySelector("#ownerLogin");
const ownerDashboard = document.querySelector("#ownerDashboard");
const plantGrid = document.querySelector("#plants");
const searchPlants = document.querySelector("#searchPlants");
const cartCount = document.querySelector("#cartCount");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const summaryItems = document.querySelector("#summaryItems");
const itemsTotal = document.querySelector("#itemsTotal");
const deliveryTotal = document.querySelector("#deliveryTotal");
const grandTotal = document.querySelector("#grandTotal");
const fulfillment = document.querySelector("#fulfillment");
const locationSelect = document.querySelector("#locationSelect");
const addressField = document.querySelector("#addressField");
const paymentMethod = document.querySelector("#paymentMethod");
const bankBox = document.querySelector("#bankBox");
const checkoutAccountName = document.querySelector("#checkoutAccountName");
const checkoutBankDetails = document.querySelector("#checkoutBankDetails");
const toast = document.querySelector("#toast");
const categoryChips = document.querySelector("#categoryChips");
const deliveryPreviewText = document.querySelector("#deliveryPreviewText");
const distanceMeter = document.querySelector("#distanceMeter");
const floatingCart = document.querySelector("#floatingCart");
const floatingCartCount = document.querySelector("#floatingCartCount");
const floatingCartTotal = document.querySelector("#floatingCartTotal");

function readPlants() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : starterPlants;
}

function savePlants() {
  localStorage.setItem(storageKey, JSON.stringify(plants));
}

function readCart() {
  const saved = localStorage.getItem(cartKey);
  return saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function readSettings() {
  const saved = localStorage.getItem(settingsKey);
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
}

function saveSettings() {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

function money(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

function h(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function deliveryFee() {
  if (fulfillment.value === "pickup") return 0;
  const selected = abujaLocations.find((location) => location.name === locationSelect.value) || abujaLocations[0];
  return selected.km === 0 ? 1500 : 1500 + selected.km * 350;
}

function selectedLocation() {
  return abujaLocations.find((location) => location.name === locationSelect.value) || abujaLocations[0];
}

function plantSvg(plant) {
  const flower = plant.tone || "#dc6b4f";
  const leaf = plant.leaf || "#28724f";
  const accent = plant.accent || "#f3c45a";
  const safeName = h(plant.name);
  const isSnake = plant.name.toLowerCase().includes("snake");
  const isAloe = plant.name.toLowerCase().includes("aloe");
  const isCroton = plant.name.toLowerCase().includes("croton");
  const isLily = plant.name.toLowerCase().includes("lily");
  const bloomOpacity = isSnake || isAloe ? "0" : "1";
  const spikeLeaves = isSnake
    ? `
      <path d="M250 368c-17-105 9-210 44-280 42 82 40 184-4 280z" fill="${leaf}"/>
      <path d="M318 368c-30-116-9-226 34-306 49 98 45 207 3 306z" fill="#244a36"/>
      <path d="M382 368c-16-98 7-185 42-247 36 78 29 168-9 247z" fill="${accent}"/>
      <path d="M321 354c3-94 10-176 28-246" stroke="#a7cc61" stroke-width="10" stroke-linecap="round" opacity=".7"/>
    `
    : "";
  const aloeLeaves = isAloe
    ? `
      <path d="M320 365c-72-92-81-185-34-257 34 82 47 166 34 257z" fill="${leaf}"/>
      <path d="M320 365c42-106 106-172 185-194-20 87-74 151-185 194z" fill="#78b36a"/>
      <path d="M316 365c-98-49-143-112-142-190 72 24 119 86 142 190z" fill="#4f915b"/>
      <path d="M320 365c-26-96-9-172 51-229 18 79 7 154-51 229z" fill="#8ebf76"/>
    `
    : "";
  const broadLeaves = !isSnake && !isAloe
    ? `
      <path d="M318 305C236 235 226 143 302 62c82 64 95 158 16 243z" fill="${leaf}"/>
      <path d="M324 306c85-62 110-147 50-238-89 49-120 132-50 238z" fill="#6da144"/>
      <path d="M301 320c-103-34-153-106-124-205 103 20 159 89 124 205z" fill="#3f8e61"/>
      <path d="M352 322c108-23 170-92 151-195-106 10-173 74-151 195z" fill="#8caf4a"/>
      <path d="M285 300c-73-6-129-39-162-99 68-18 127 12 162 99z" fill="#286f51"/>
      <path d="M371 301c70-21 130-2 179 55-70 33-132 14-179-55z" fill="#5c994d"/>
    `
    : "";
  const crotonMarks = isCroton
    ? `
      <path d="M226 182c35 26 60 62 74 109" stroke="#f0b23d" stroke-width="10" stroke-linecap="round" opacity=".85"/>
      <path d="M381 137c-28 48-41 95-40 143" stroke="#c94d3d" stroke-width="10" stroke-linecap="round" opacity=".85"/>
      <path d="M449 228c-39 9-70 29-96 60" stroke="#f0b23d" stroke-width="9" stroke-linecap="round" opacity=".8"/>
    `
    : "";
  const lilyBloom = isLily
    ? `
      <path d="M327 168c-28-42-18-83 30-124 29 48 18 90-30 124z" fill="#fffdf2" opacity="${bloomOpacity}"/>
      <path d="M318 175c-51-3-82-30-94-92 56 1 88 31 94 92z" fill="#fff8df" opacity="${bloomOpacity}"/>
      <path d="M343 178c44-27 86-20 126 24-48 31-91 21-126-24z" fill="#ffffff" opacity="${bloomOpacity}"/>
      <circle cx="335" cy="172" r="12" fill="#e9bf4f" opacity="${bloomOpacity}"/>
    `
    : "";
  const normalBlooms = !isLily
    ? `
      <circle cx="245" cy="166" r="30" fill="${flower}" opacity="${bloomOpacity}"/>
      <circle cx="355" cy="134" r="34" fill="${flower}" opacity="${bloomOpacity}"/>
      <circle cx="414" cy="214" r="28" fill="${flower}" opacity="${bloomOpacity}"/>
      <circle cx="316" cy="222" r="22" fill="${accent}" opacity="${bloomOpacity}"/>
      <circle cx="355" cy="134" r="10" fill="${accent}" opacity="${bloomOpacity}"/>
    `
    : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-label="${safeName}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f4fbef"/>
          <stop offset="0.5" stop-color="#f8e2c2"/>
          <stop offset="1" stop-color="#c7e1ce"/>
        </linearGradient>
        <linearGradient id="pot" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#e59b68"/>
          <stop offset="1" stop-color="#8f4f38"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#123e32" flood-opacity=".22"/>
        </filter>
      </defs>
      <rect width="640" height="480" fill="url(#bg)"/>
      <circle cx="94" cy="78" r="58" fill="#f1bd53" opacity=".5"/>
      <circle cx="548" cy="92" r="82" fill="#ffffff" opacity=".32"/>
      <path d="M0 390c102-50 197-54 286-12 107 50 220 45 354-32v134H0z" fill="#ffffff" opacity=".42"/>
      <ellipse cx="320" cy="416" rx="172" ry="28" fill="#123e32" opacity="0.13"/>
      <g filter="url(#shadow)">
        ${broadLeaves}
        ${spikeLeaves}
        ${aloeLeaves}
        ${crotonMarks}
        ${normalBlooms}
        ${lilyBloom}
        <path d="M218 294h204l-29 128H247z" fill="url(#pot)"/>
        <rect x="195" y="269" width="250" height="42" rx="14" fill="#efa477"/>
        <path d="M252 326h116" stroke="#f5c099" stroke-width="9" stroke-linecap="round" opacity=".45"/>
      </g>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function plantImage(plant) {
  if (plant.image) {
    return `<img src="${plant.image}" alt="${h(plant.name)}" />`;
  }

  return `<img src="${plantSvg(plant)}" alt="${h(plant.name)}" />`;
}

function renderPlants() {
  const term = searchPlants.value.trim().toLowerCase();
  const category = currentCategory;
  const visiblePlants = plants.filter((plant) => {
    const matchesTerm = plant.name.toLowerCase().includes(term);
    const matchesCategory = category === "all" || plant.category === category;
    return matchesTerm && matchesCategory;
  });

  plantGrid.innerHTML = visiblePlants.length
    ? visiblePlants
        .map(
          (plant) => `
          <article class="plant-card">
            <div class="plant-photo">${plantImage(plant)}</div>
            <div class="plant-body">
              <div class="plant-meta">
                <h3>${h(plant.name)}</h3>
                <span class="price">${money(plant.price)}</span>
              </div>
              <div class="tag-row">
                <span class="tag">${h(plant.category)}</span>
                <span class="tag">${plant.stock > 0 ? `${plant.stock} available` : "Sold out"}</span>
              </div>
              <p>${h(plant.description || "Healthy potted flower plant available from Floragreen House.")}</p>
              <button class="primary-button" type="button" data-add="${plant.id}" ${plant.stock < 1 ? "disabled" : ""}>Add to cart</button>
            </div>
          </article>
        `
        )
        .join("")
    : `<p>No plants match your search.</p>`;
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => {
    const plant = plants.find((entry) => entry.id === item.id);
    return plant ? sum + plant.price * item.qty : sum;
  }, 0);
  cartCount.textContent = count;
  floatingCartCount.textContent = count;
  floatingCartTotal.textContent = money(subtotal);
  floatingCart.classList.toggle("visible", count > 0);

  cartItems.innerHTML = cart.length
    ? cart
        .map((item) => {
          const plant = plants.find((entry) => entry.id === item.id);
          if (!plant) return "";
          return `
            <div class="cart-line">
              <div>
                <strong>${h(plant.name)}</strong>
                <p>${money(plant.price)} each</p>
              </div>
              <div class="cart-controls">
                <button class="qty-button" type="button" data-dec="${plant.id}">-</button>
                <strong>${item.qty}</strong>
                <button class="qty-button" type="button" data-inc="${plant.id}">+</button>
                <button class="remove-button" type="button" data-remove="${plant.id}">Remove</button>
              </div>
            </div>
          `;
        })
        .join("")
    : `<p>Your cart is empty.</p>`;

  renderSummary();
  saveCart();
}

function renderSummary() {
  const lines = cart
    .map((item) => {
      const plant = plants.find((entry) => entry.id === item.id);
      if (!plant) return "";
      return `<div class="summary-line"><span>${h(plant.name)} x ${item.qty}</span><strong>${money(plant.price * item.qty)}</strong></div>`;
    })
    .join("");

  const subtotal = cart.reduce((sum, item) => {
    const plant = plants.find((entry) => entry.id === item.id);
    return plant ? sum + plant.price * item.qty : sum;
  }, 0);
  const delivery = deliveryFee();
  const location = selectedLocation();
  const maxKm = Math.max(...abujaLocations.map((entry) => entry.km));

  summaryItems.innerHTML = lines || `<p>No items selected.</p>`;
  itemsTotal.textContent = money(subtotal);
  deliveryTotal.textContent = money(delivery);
  grandTotal.textContent = money(subtotal + delivery);
  if (fulfillment.value === "pickup") {
    deliveryPreviewText.textContent = "Pickup selected. Delivery is free.";
    distanceMeter.style.width = "0%";
  } else {
    deliveryPreviewText.textContent = `${location.name}: ${location.km} km from CBD, ${money(delivery)}`;
    distanceMeter.style.width = `${Math.max(6, (location.km / maxKm) * 100)}%`;
  }
}

function orderTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const plant = plants.find((entry) => entry.id === item.id);
    return plant ? sum + plant.price * item.qty : sum;
  }, 0);
  const delivery = deliveryFee();
  return { subtotal, delivery, total: subtotal + delivery };
}

function orderLines() {
  return cart
    .map((item) => {
      const plant = plants.find((entry) => entry.id === item.id);
      if (!plant) return "";
      return `- ${plant.name} x ${item.qty}: ${money(plant.price * item.qty)}`;
    })
    .filter(Boolean);
}

function cleanWhatsAppNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function buildWhatsAppOrder(form) {
  const data = new FormData(form);
  const location = selectedLocation();
  const totals = orderTotals();
  const fulfillmentText = data.get("fulfillment") === "pickup" ? "Pickup" : `Delivery to ${location.name}`;
  const address = data.get("fulfillment") === "pickup" ? "Pickup selected" : data.get("address");

  return [
    "Hello Floragreen House, I want to place an order.",
    "",
    "Customer details:",
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Fulfillment: ${fulfillmentText}`,
    `Address: ${address || "Not provided"}`,
    `Payment: ${data.get("payment")}`,
    "",
    "Order:",
    ...orderLines(),
    "",
    `Items total: ${money(totals.subtotal)}`,
    `Delivery: ${money(totals.delivery)}`,
    `Grand total: ${money(totals.total)}`
  ].join("\n");
}

function openWhatsAppOrder(message) {
  const number = cleanWhatsAppNumber(settings.whatsappNumber);
  if (!number) {
    showToast("Owner needs to add a WhatsApp order number in management.");
    return false;
  }
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
  return true;
}

function addToCart(id) {
  const plant = plants.find((entry) => entry.id === id);
  if (!plant || plant.stock < 1) return;
  const existing = cart.find((item) => item.id === id);
  const currentQty = existing ? existing.qty : 0;
  if (currentQty >= plant.stock) {
    showToast("That is all the stock available for this plant.");
    return;
  }
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  renderCart();
  document.querySelector("#openCart").classList.add("bump");
  floatingCart.classList.add("bump");
  window.setTimeout(() => {
    document.querySelector("#openCart").classList.remove("bump");
    floatingCart.classList.remove("bump");
  }, 380);
  showToast(`${plant.name} added to cart.`);
}

function updateQty(id, delta) {
  const plant = plants.find((entry) => entry.id === id);
  const item = cart.find((entry) => entry.id === id);
  if (!plant || !item) return;
  item.qty += delta;
  if (item.qty > plant.stock) item.qty = plant.stock;
  if (item.qty <= 0) cart = cart.filter((entry) => entry.id !== id);
  renderCart();
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.querySelector("#scrim").classList.add("show");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.querySelector("#scrim").classList.remove("show");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function populateLocations() {
  locationSelect.innerHTML = abujaLocations
    .map((location) => `<option value="${location.name}">${location.name} - ${location.km} km from CBD</option>`)
    .join("");
}

function enhanceSelect(select) {
  if (select.closest(".custom-select")) return;
  const shell = document.createElement("div");
  shell.className = "custom-select";
  const trigger = document.createElement("button");
  trigger.className = "select-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const menu = document.createElement("div");
  menu.className = "select-options";
  menu.setAttribute("role", "listbox");

  select.parentNode.insertBefore(shell, select);
  shell.appendChild(select);
  shell.appendChild(trigger);
  shell.appendChild(menu);

  const instance = { select, shell, trigger, menu };
  customSelects.push(instance);

  trigger.addEventListener("click", () => {
    if (select.disabled) return;
    const nextOpen = !shell.classList.contains("open");
    closeSelectMenus();
    shell.classList.toggle("open", nextOpen);
    trigger.setAttribute("aria-expanded", String(nextOpen));
  });

  menu.addEventListener("click", (event) => {
    const optionButton = event.target.closest(".select-option");
    if (!optionButton) return;
    select.value = optionButton.dataset.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    closeSelectMenus();
    refreshCustomSelect(instance);
  });

  select.addEventListener("change", () => refreshCustomSelect(instance));
  refreshCustomSelect(instance);
}

function refreshCustomSelect(instance) {
  const { select, shell, trigger, menu } = instance;
  const selected = select.options[select.selectedIndex];
  trigger.textContent = selected ? selected.textContent : "Choose option";
  shell.classList.toggle("disabled", select.disabled);
  menu.innerHTML = Array.from(select.options)
    .map(
      (option) => `
      <button class="select-option ${option.value === select.value ? "selected" : ""}" type="button" role="option" data-value="${h(option.value)}" aria-selected="${option.value === select.value}">
        ${h(option.textContent)}
      </button>
    `
    )
    .join("");
}

function refreshCustomSelects() {
  customSelects.forEach(refreshCustomSelect);
}

function closeSelectMenus() {
  customSelects.forEach(({ shell, trigger }) => {
    shell.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  });
}

function enhanceSelects() {
  document.querySelectorAll("select").forEach(enhanceSelect);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".custom-select")) closeSelectMenus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSelectMenus();
  });
}

function toggleCheckoutFields() {
  const isPickup = fulfillment.value === "pickup";
  locationSelect.disabled = isPickup;
  addressField.disabled = isPickup;
  addressField.required = !isPickup;
  addressField.placeholder = isPickup ? "Pickup selected" : "Street, estate, landmark";
  renderSummary();
  refreshCustomSelects();
}

function togglePayment() {
  bankBox.hidden = paymentMethod.value !== "Bank transfer";
}

function renderPaymentSettings() {
  checkoutAccountName.textContent = settings.accountName;
  checkoutBankDetails.textContent = `${settings.bankName} ${settings.accountNumber}`;
  document.querySelector("#accountName").value = settings.accountName;
  document.querySelector("#bankName").value = settings.bankName;
  document.querySelector("#accountNumber").value = settings.accountNumber;
  document.querySelector("#whatsappNumber").value = settings.whatsappNumber;
}

function route() {
  const isOwner = window.location.hash === "#owner";
  customerApp.hidden = isOwner;
  document.querySelector(".topbar").hidden = isOwner;
  ownerApp.hidden = !isOwner;
  if (isOwner) closeCart();
}

function renderAdminList() {
  const adminList = document.querySelector("#adminList");
  adminList.innerHTML = plants
    .map(
      (plant) => `
      <article class="admin-row">
        <div class="admin-thumb">${plant.image ? `<img src="${plant.image}" alt="${h(plant.name)}" />` : plantImage(plant)}</div>
        <div>
          <h3>${h(plant.name)}</h3>
          <p>${h(plant.category)} · ${money(plant.price)} · ${plant.stock} in stock</p>
        </div>
        <div class="admin-actions">
          <button class="secondary-button" type="button" data-edit="${plant.id}">Edit</button>
          <button class="secondary-button" type="button" data-delete="${plant.id}">Delete</button>
        </div>
      </article>
    `
    )
    .join("");
}

function resetPlantForm() {
  document.querySelector("#editId").value = "";
  document.querySelector("#plantName").value = "";
  document.querySelector("#plantPrice").value = "";
  document.querySelector("#plantCategory").value = "Flowering";
  document.querySelector("#plantStock").value = "1";
  document.querySelector("#plantDescription").value = "";
  document.querySelector("#plantImage").value = "";
  pendingImage = "";
}

function editPlant(id) {
  const plant = plants.find((entry) => entry.id === id);
  if (!plant) return;
  document.querySelector("#editId").value = plant.id;
  document.querySelector("#plantName").value = plant.name;
  document.querySelector("#plantPrice").value = plant.price;
  document.querySelector("#plantCategory").value = plant.category;
  document.querySelector("#plantStock").value = plant.stock;
  document.querySelector("#plantDescription").value = plant.description || "";
  pendingImage = plant.image || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function removePlant(id) {
  plants = plants.filter((plant) => plant.id !== id);
  cart = cart.filter((item) => item.id !== id);
  savePlants();
  renderPlants();
  renderCart();
  renderAdminList();
}

function initEvents() {
  searchPlants.addEventListener("input", renderPlants);
  document.querySelector("#openCart").addEventListener("click", openCart);
  floatingCart.addEventListener("click", openCart);
  document.querySelector("#closeCart").addEventListener("click", closeCart);
  document.querySelector("#scrim").addEventListener("click", closeCart);
  document.querySelector("#checkoutLink").addEventListener("click", closeCart);
  fulfillment.addEventListener("change", toggleCheckoutFields);
  locationSelect.addEventListener("change", renderSummary);
  paymentMethod.addEventListener("change", togglePayment);
  window.addEventListener("hashchange", route);

  categoryChips.addEventListener("click", (event) => {
    const category = event.target.dataset.category;
    if (!category) return;
    currentCategory = category;
    syncChips(category);
    renderPlants();
  });

  plantGrid.addEventListener("click", (event) => {
    const id = event.target.dataset.add;
    if (id) addToCart(id);
  });

  cartItems.addEventListener("click", (event) => {
    const inc = event.target.dataset.inc;
    const dec = event.target.dataset.dec;
    const remove = event.target.dataset.remove;
    if (inc) updateQty(inc, 1);
    if (dec) updateQty(dec, -1);
    if (remove) {
      cart = cart.filter((item) => item.id !== remove);
      renderCart();
    }
  });

  document.querySelector("#checkoutForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cart.length) {
      showToast("Add at least one plant before placing an order.");
      return;
    }

    const message = buildWhatsAppOrder(event.target);
    if (!openWhatsAppOrder(message)) return;

    cart.forEach((item) => {
      const plant = plants.find((entry) => entry.id === item.id);
      if (plant) plant.stock = Math.max(0, plant.stock - item.qty);
    });

    savePlants();
    cart = [];
    renderPlants();
    renderCart();
    renderAdminList();
    event.target.reset();
    toggleCheckoutFields();
    togglePayment();
    showToast("WhatsApp opened with the order details. Tap Send there to notify the owner.");
  });

  document.querySelector("#paymentSettingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    settings = {
      accountName: document.querySelector("#accountName").value.trim(),
      bankName: document.querySelector("#bankName").value.trim(),
      accountNumber: document.querySelector("#accountNumber").value.trim(),
      whatsappNumber: cleanWhatsAppNumber(document.querySelector("#whatsappNumber").value)
    };
    saveSettings();
    renderPaymentSettings();
    showToast("Payment details updated.");
  });

  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (document.querySelector("#passcode").value === ownerPasscode) {
      ownerLogin.hidden = true;
      ownerDashboard.hidden = false;
      document.querySelector("#loginError").textContent = "";
      renderAdminList();
      return;
    }
    document.querySelector("#loginError").textContent = "Incorrect passcode.";
  });

  document.querySelector("#leaveOwner").addEventListener("click", () => {
    window.location.hash = "#shop";
  });

  document.querySelector("#plantImage").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingImage = reader.result;
      showToast("Picture ready. Save plant to publish it.");
    };
    reader.readAsDataURL(file);
  });

  document.querySelector("#plantForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.querySelector("#editId").value || `plant-${Date.now()}`;
    const existing = plants.find((plant) => plant.id === id);
    const nextPlant = {
      id,
      name: document.querySelector("#plantName").value.trim(),
      price: Number(document.querySelector("#plantPrice").value),
      category: document.querySelector("#plantCategory").value,
      stock: Number(document.querySelector("#plantStock").value),
      image: pendingImage || existing?.image || "",
      tone: existing?.tone || "#dc6b4f",
      description:
        document.querySelector("#plantDescription").value.trim() ||
        "Healthy potted flower plant available from Floragreen House."
    };

    if (existing) plants = plants.map((plant) => (plant.id === id ? nextPlant : plant));
    else plants.unshift(nextPlant);

    savePlants();
    resetPlantForm();
    renderPlants();
    renderCart();
    renderAdminList();
    showToast("Plant saved.");
  });

  document.querySelector("#resetForm").addEventListener("click", resetPlantForm);

  document.querySelector("#adminList").addEventListener("click", (event) => {
    const edit = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    if (edit) editPlant(edit);
    if (deleteId && window.confirm("Delete this plant from the owner inventory?")) removePlant(deleteId);
  });
}

function syncChips(category) {
  categoryChips.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.category === category);
  });
}

populateLocations();
enhanceSelects();
initEvents();
route();
toggleCheckoutFields();
togglePayment();
renderPaymentSettings();
renderPlants();
renderCart();
renderAdminList();
