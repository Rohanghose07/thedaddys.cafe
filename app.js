"use strict";

/**
 * The Daddy's Cafe — Storefront
 * Supabase-powered live menu with local fallback.
 */

const STORE_CONFIG = Object.freeze({
  name: "The Daddy's Cafe",
  city: "Silchar",
  whatsappNumber: "919181333402",
  displayPhone: "(+91) 91813 33402",
  upiId: "9181333402@okbizaxis",
  upiPayeeName: "The Daddy's Cafe"
});

const WHATSAPP_NUMBER = STORE_CONFIG.whatsappNumber;
const DISPLAY_NUMBER = STORE_CONFIG.displayPhone;


/* =========================================================
   FALLBACK MENU

   This is used only if Supabase cannot be reached.
========================================================= */

const FALLBACK_MENU = [

  {category:"Starters",name:"Daddy's Crispy Chicken Pakoda (10 Pcs)",price:130},
  {category:"Starters",name:"Classic Egg Devil (2 Pcs)",price:99},
  {category:"Starters",name:"Cheesy Chicken Balls (6 Pcs)",price:170},

  {category:"Gravy Items",name:"Chilli Chicken",price:160},
  {category:"Gravy Items",name:"Chicken 65",price:160},
  {category:"Gravy Items",name:"Chilli Paneer",price:130},
  {category:"Gravy Items",name:"Chilli Baby Corn",price:120},

  {category:"Fried Rice",subcategory:"Classic",name:"Veg Fried Rice",price:70},
  {category:"Fried Rice",subcategory:"Classic",name:"Egg Fried Rice",price:90},
  {category:"Fried Rice",subcategory:"Classic",name:"Chicken Fried Rice",price:100},
  {category:"Fried Rice",subcategory:"Classic",name:"Egg Chicken Fried Rice",price:120},
  {category:"Fried Rice",subcategory:"Classic",name:"Baby Corn Fried Rice",price:90},

  {category:"Fried Rice",subcategory:"Schezwan",name:"Veg Schezwan Fried Rice",price:90},
  {category:"Fried Rice",subcategory:"Schezwan",name:"Egg Schezwan Fried Rice",price:110},
  {category:"Fried Rice",subcategory:"Schezwan",name:"Chicken Schezwan Fried Rice",price:130},
  {category:"Fried Rice",subcategory:"Schezwan",name:"Egg Chicken Schezwan Fried Rice",price:150},
  {category:"Fried Rice",subcategory:"Schezwan",name:"Baby Corn Schezwan Fried Rice",price:110},

  {category:"Hakka Noodles",subcategory:"Classic",name:"Veg Hakka Noodles",price:70},
  {category:"Hakka Noodles",subcategory:"Classic",name:"Egg Hakka Noodles",price:90},
  {category:"Hakka Noodles",subcategory:"Classic",name:"Chicken Hakka Noodles",price:100},
  {category:"Hakka Noodles",subcategory:"Classic",name:"Egg Chicken Hakka Noodles",price:120},
  {category:"Hakka Noodles",subcategory:"Classic",name:"Baby Corn Hakka Noodles",price:90},

  {category:"Hakka Noodles",subcategory:"Schezwan",name:"Veg Schezwan Noodles",price:90},
  {category:"Hakka Noodles",subcategory:"Schezwan",name:"Egg Schezwan Noodles",price:110},
  {category:"Hakka Noodles",subcategory:"Schezwan",name:"Chicken Schezwan Noodles",price:130},
  {category:"Hakka Noodles",subcategory:"Schezwan",name:"Egg Chicken Schezwan Noodles",price:150},
  {category:"Hakka Noodles",subcategory:"Schezwan",name:"Baby Corn Schezwan Noodles",price:110},

  {category:"Kolkata Rolls",name:"Paneer Roll",price:80},
  {category:"Kolkata Rolls",name:"Egg Roll",price:70},
  {category:"Kolkata Rolls",name:"Chicken Roll",price:100},
  {category:"Kolkata Rolls",name:"Egg Chicken Roll",price:120},

  {category:"Grilled Sandwiches",name:"Corn Sandwich",price:70},
  {category:"Grilled Sandwiches",name:"Paneer Sandwich",price:90},
  {category:"Grilled Sandwiches",name:"Corn & Paneer Sandwich",price:110},
  {category:"Grilled Sandwiches",name:"Chicken Sandwich",price:130},
  {category:"Grilled Sandwiches",name:"Chicken & Corn Sandwich",price:150},

  {category:"Momos",subcategory:"Steamed",name:"Veg Momos (6 Pcs)",price:40},
  {category:"Momos",subcategory:"Steamed",name:"Chicken Momos (6 Pcs)",price:60},
  {category:"Momos",subcategory:"Fried",name:"Veg Fried Momos (6 Pcs)",price:70},
  {category:"Momos",subcategory:"Fried",name:"Chicken Fried Momos (6 Pcs)",price:90},
  {category:"Momos",subcategory:"Pan Fried",name:"Veg Pan Fried Momos (6 Pcs)",price:90},
  {category:"Momos",subcategory:"Pan Fried",name:"Chicken Pan Fried Momos (6 Pcs)",price:110},

  {category:"Maggi",name:"Fried Masala Maggi",price:50},
  {category:"Maggi",name:"Cheesy Fried Masala Maggi",price:80},

  {category:"Indian Breads",name:"Tawa Roti",price:10},
  {category:"Indian Breads",name:"Butter Roti",price:15},
  {category:"Indian Breads",name:"Paratha",price:30},
  {category:"Indian Breads",name:"Masala Omelette (Double Egg)",price:60}

];


/* =========================================================
   APPLICATION STATE
========================================================= */

let liveCatalog = [];

let cart = [];

try {

  const savedCart =
    JSON.parse(
      localStorage.getItem("tdcCart") || "[]"
    );

  cart =
    Array.isArray(savedCart)
      ? savedCart
      : [];

} catch {

  cart = [];

  localStorage.removeItem("tdcCart");

}

let activeCategory = "All";

let orderType = "Takeaway";


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];

const money = value =>
  `₹${Number(value || 0)}`;


const CATEGORY_IMAGE = {

  "Starters":"🍗",

  "Gravy Items":"🍲",

  "Fried Rice":"🍚",

  "Hakka Noodles":"🍜",

  "Kolkata Rolls":"🌯",

  "Grilled Sandwiches":"🥪",

  "Momos":"🥟",

  "Maggi":"🍝",

  "Indian Breads":"🫓"

};


/* =========================================================
   DEFAULT DESCRIPTION
========================================================= */

function defaultDescription(item){

  const name =
    String(item.name || "")
      .toLowerCase();

  if(name.includes("fried rice"))

    return "Wok-tossed rice prepared fresh with aromatic seasoning and classic Indo-Chinese flavours.";


  if(name.includes("noodles"))

    return "Freshly wok-tossed noodles with vegetables, seasoning and bold Indo-Chinese flavour.";


  if(name.includes("roll"))

    return "Fresh Kolkata-style roll wrapped in a soft paratha with flavourful filling and house seasoning.";


  if(name.includes("momo"))

    return "Juicy dumplings prepared fresh and served with a punchy house-style accompaniment.";


  if(name.includes("sandwich"))

    return "Freshly grilled sandwich with a crisp exterior and a generous savoury filling.";


  if(name.includes("maggi"))

    return "Comforting masala noodles tossed hot and fresh for a quick, flavour-packed bite.";


  if(
    name.includes("chilli") ||
    name.includes("65")
  )

    return "Bold Indo-Chinese preparation with a savoury, spicy and satisfying finish.";


  if(
    name.includes("pakoda") ||
    name.includes("balls") ||
    name.includes("devil")
  )

    return "Crisp, freshly prepared snack made for sharing or enjoying as a hearty starter.";


  return "Freshly prepared to order with The Daddy's Cafe house-style flavours.";

}


/* =========================================================
   NORMALIZE SUPABASE ROW

   Handles likely column names safely.
========================================================= */

function normalizeMenuItem(row, index){

  const available =
    row.is_available !== undefined
      ? row.is_available
      : row.available !== undefined
        ? row.available
        : true;


  const bestseller =
    row.is_bestseller !== undefined
      ? row.is_bestseller
      : row.bestseller !== undefined
        ? row.bestseller
        : false;


  const image =
    row.image_url ||
    row.image ||
    "";


  const item = {

    id:
      row.id ??
      `supabase-${index + 1}`,

    name:
      row.name || "",

    category:
      row.category || "Other",

    subcategory:
      row.subcategory || "",

    price:
      Number(row.price || 0),

    description:
      row.description || "",

    image,

    stock:
      Number.isFinite(Number(row.stock))
        ? Number(row.stock)
        : 999,

    available:
      available !== false,

    bestseller:
      bestseller === true

  };


  if(!item.description){

    item.description =
      defaultDescription(item);

  }


  return item;

}


/* =========================================================
   FALLBACK CATALOG
========================================================= */

function createFallbackCatalog(){

  return FALLBACK_MENU.map(
    (item, index) => ({

      ...item,

      id:
        `fallback-${index + 1}`,

      description:
        item.description ||
        defaultDescription(item),

      image:
        item.image || "",

      stock:
        Number.isFinite(Number(item.stock))
          ? Number(item.stock)
          : 999,

      available:
        item.available !== false,

      bestseller:
        item.bestseller === true

    })
  );

}


/* =========================================================
   LOAD MENU FROM SUPABASE
========================================================= */

async function loadMenuFromSupabase(){

  const menuGrid =
    $("#menuGrid");


  if(menuGrid){

    menuGrid.innerHTML =
      '<div class="empty-cart">Loading menu...</div>';

  }


  try {

    if(!window.supabaseClient){

      throw new Error(
        "Supabase client is not available. Check supabase-config.js."
      );

    }


    const {
      data,
      error
    } =
      await window.supabaseClient
        .from("menu_items")
        .select("*");


    if(error){

      throw error;

    }


    if(!Array.isArray(data)){

      throw new Error(
        "Invalid menu data returned by Supabase."
      );

    }


    if(data.length === 0){

      console.warn(
        "Supabase menu_items is empty. Using fallback menu."
      );

      liveCatalog =
        createFallbackCatalog();

    } else {

      liveCatalog =
        data
          .map(normalizeMenuItem)
          .filter(
            item =>
              item.name &&
              item.category
          );

    }


    console.log(
      "Menu loaded from Supabase:",
      liveCatalog.length,
      "items"
    );


  } catch(error){

    console.error(
      "Supabase menu load failed:",
      error
    );


    liveCatalog =
      createFallbackCatalog();

  }


  renderCategories();

  renderMenu();

}


/* =========================================================
   RETURN CURRENT CATALOG
========================================================= */

function loadCatalog(){

  return liveCatalog;

}


/* =========================================================
   CART STORAGE
========================================================= */

function saveCart(){

  localStorage.setItem(
    "tdcCart",
    JSON.stringify(cart)
  );

}


/* =========================================================
   CATEGORY TABS
========================================================= */

function renderCategories(){

  const categoryTabs =
    $("#categoryTabs");


  if(!categoryTabs){

    return;

  }


  const cats = [

    "All",

    ...new Set(
      loadCatalog()
        .map(item => item.category)
        .filter(Boolean)
    )

  ];


  if(
    activeCategory !== "All" &&
    !cats.includes(activeCategory)
  ){

    activeCategory = "All";

  }


  categoryTabs.innerHTML =
    cats
      .map(category =>

        `<button
          class="category-tab ${category === activeCategory ? "active" : ""}"
          data-cat="${encodeURIComponent(category)}"
        >
          ${category}
        </button>`

      )
      .join("");


  $$(".category-tab")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          activeCategory =
            decodeURIComponent(
              button.dataset.cat
            );

          renderCategories();

          renderMenu();

        }
      );

    });

}


/* =========================================================
   MENU RENDER
========================================================= */

function menuCardHTML(item, compact = false){

  const unavailable =
    !item.available ||
    item.stock <= 0;

  const imageHTML = item.image
    ? `
      <img
        src="${item.image}"
        alt="${item.name}"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      >
      <div class="food-image-placeholder" style="display:none">
        <span>${CATEGORY_IMAGE[item.category] || "🍽️"}</span>
        <small>Photo unavailable</small>
      </div>`
    : `
      <div class="food-image-placeholder">
        <span>${CATEGORY_IMAGE[item.category] || "🍽️"}</span>
        <small>Photo coming soon</small>
      </div>`;

  return `
    <article class="menu-card food-card ${compact ? "featured-food-card" : ""} ${unavailable ? "sold-out" : ""}">
      <div class="food-image-wrap">
        ${imageHTML}
        <div class="food-image-overlay" aria-hidden="true"></div>
        <div class="food-card-badges">
          ${item.bestseller ? `<span class="food-badge bestseller-badge">★ Bestseller</span>` : ""}
          ${unavailable ? `<span class="food-badge unavailable-badge">Sold out</span>` : ""}
        </div>
      </div>

      <div class="food-copy">
        <div class="menu-card-top">
          <div>
            <div class="food-meta-row">
              <span class="food-category-label">${item.category}</span>
              ${item.subcategory ? `<span class="menu-meta">${item.subcategory}</span>` : ""}
            </div>
            <h3>${item.name}</h3>
            <p class="food-description">${item.description}</p>
          </div>
        </div>

        <div class="menu-card-bottom">
          <div class="food-price-block">
            <span class="price">${money(item.price)}</span>
            <small>incl. applicable taxes</small>
          </div>
          <button
            class="add-btn"
            data-name="${encodeURIComponent(item.name)}"
            ${unavailable ? "disabled" : ""}
          >${unavailable ? "SOLD OUT" : "ADD +"}</button>
        </div>
      </div>
    </article>`;
}


function renderPopularPicks(catalog, query){

  const popular = $("#popularPicks");

  if(!popular){
    return;
  }

  if(query || activeCategory !== "All"){
    popular.innerHTML = "";
    popular.hidden = true;
    return;
  }

  const picks = catalog
    .filter(item => item.bestseller && item.available && item.stock > 0)
    .slice(0, 6);

  if(!picks.length){
    popular.innerHTML = "";
    popular.hidden = true;
    return;
  }

  popular.hidden = false;
  popular.innerHTML = `
    <div class="popular-picks-head">
      <div>
        <span class="section-kicker">CUSTOMER FAVOURITES</span>
        <h3>Popular Picks</h3>
        <p>Quick choices from our most-loved dishes.</p>
      </div>
      <span class="popular-chip">★ Bestsellers</span>
    </div>
    <div class="popular-picks-grid">
      ${picks.map(item => menuCardHTML(item, true)).join("")}
    </div>`;
}


function bindAddButtons(){

  $$(".add-btn")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          addItem(
            decodeURIComponent(
              button.dataset.name
            )
          );
        }
      );
    });
}


function renderMenu(){

  const menuGrid = $("#menuGrid");

  if(!menuGrid){
    return;
  }

  const searchInput = $("#menuSearch");
  const query = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const catalog = loadCatalog();

  renderPopularPicks(catalog, query);

  const filtered = catalog.filter(item =>
    (
      activeCategory === "All" ||
      item.category === activeCategory
    )
    &&
    (
      !query ||
      `${item.name} ${item.category} ${item.subcategory || ""} ${item.description || ""}`
        .toLowerCase()
        .includes(query)
    )
  );

  if(!filtered.length){
    menuGrid.innerHTML = `
      <div class="empty-menu-state">
        <span>⌕</span>
        <strong>No dishes found</strong>
        <p>Try another dish name or choose a different category.</p>
      </div>`;
    bindAddButtons();
    return;
  }

  const grouped = filtered.reduce((groups, item) => {
    if(!groups[item.category]){
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {});

  menuGrid.innerHTML = Object.entries(grouped)
    .map(([category, items]) => `
      <section class="menu-category-section">
        <div class="menu-category-heading">
          <div>
            <span class="category-line"></span>
            <h3>${category}</h3>
          </div>
          <span class="category-count">
            ${items.length} item${items.length === 1 ? "" : "s"}
          </span>
        </div>
        <div class="category-items-grid">
          ${items.map(item => menuCardHTML(item)).join("")}
        </div>
      </section>`)
    .join("");

  bindAddButtons();
}


/* =========================================================
   ADD ITEM
========================================================= */

function addItem(name){

  const product =
    loadCatalog()
      .find(
        item =>
          item.name === name
      );


  if(
    !product ||
    !product.available ||
    product.stock <= 0
  ){

    alert(
      "This item is currently unavailable."
    );

    return;

  }


  const existing =
    cart.find(
      item =>
        item.name === name
    );


  if(existing){

    existing.qty++;

  } else {

    cart.push({

      ...product,

      qty: 1

    });

  }


  saveCart();

  renderCart();

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQty(name, delta){

  const line =
    cart.find(
      item =>
        item.name === name
    );


  if(!line){

    return;

  }


  line.qty += delta;


  if(line.qty <= 0){

    cart =
      cart.filter(
        item =>
          item.name !== name
      );

  }


  saveCart();

  renderCart();

}


/* =========================================================
   REMOVE ITEM
========================================================= */

function removeItem(name){

  cart =
    cart.filter(
      item =>
        item.name !== name
    );


  saveCart();

  renderCart();

}


/* =========================================================
   TOTALS
========================================================= */

function totals(){

  const subtotal =
    cart.reduce(
      (sum, item) =>
        sum +
        (
          Number(item.price) *
          Number(item.qty)
        ),
      0
    );


  const platformFee =
    cart.length
      ? Math.round(
          subtotal * 0.03
        )
      : 0;


  const handlingFee =
    cart.length

      ? (
          orderType === "Delivery"
            ? 40
            : 15
        )

      : 0;


  return {

    count:
      cart.reduce(
        (sum, item) =>
          sum + item.qty,
        0
      ),

    subtotal,

    platformFee,

    handlingFee,

    total:
      subtotal +
      platformFee +
      handlingFee

  };

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart(){

  const {

    count,

    subtotal,

    platformFee,

    handlingFee,

    total

  } = totals();


  const headerCartCount =
    $("#headerCartCount");

  if(headerCartCount){

    headerCartCount.textContent =
      count;

  }


  const mobileCartCount =
    $("#mobileCartCount");

  if(mobileCartCount){

    mobileCartCount.textContent =

      `${count} item${count === 1 ? "" : "s"}`;

  }


  const mobileCartTotal =
    $("#mobileCartTotal");

  if(mobileCartTotal){

    mobileCartTotal.textContent =
      money(total);

  }


  const cartSubtotal =
    $("#cartSubtotal");

  if(cartSubtotal){

    cartSubtotal.textContent =
      money(subtotal);

  }


  const cartPlatformFee =
    $("#cartPlatformFee");

  if(cartPlatformFee){

    cartPlatformFee.textContent =
      money(platformFee);

  }


  const cartFeeLabel =
    $("#cartFeeLabel");

  if(cartFeeLabel){

    cartFeeLabel.textContent =

      orderType === "Delivery"

        ? "Delivery & Handling"

        : "Packing & Disposables";

  }


  const cartHandlingFee =
    $("#cartHandlingFee");

  if(cartHandlingFee){

    cartHandlingFee.textContent =
      money(handlingFee);

  }


  const cartGrandTotal =
    $("#cartGrandTotal");

  if(cartGrandTotal){

    cartGrandTotal.textContent =
      money(total);

  }


  const mobileCartBar =
    $("#mobileCartBar");

  if(mobileCartBar){

    mobileCartBar.classList.toggle(
      "visible",
      count > 0
    );

  }


  const cartItems =
    $("#cartItems");


  if(cartItems){

    cartItems.innerHTML =

      cart.length

      ? cart.map(
          item => `

          <div class="cart-line">

            <div>

              <h4>
                ${item.name}
              </h4>

              <small>
                ${money(item.price)} each
              </small>


              <div class="qty">

                <button
                  data-action="minus"
                  data-name="${encodeURIComponent(item.name)}"
                >
                  −
                </button>

                <strong>
                  ${item.qty}
                </strong>

                <button
                  data-action="plus"
                  data-name="${encodeURIComponent(item.name)}"
                >
                  +
                </button>

              </div>


              <button
                class="remove-btn"
                data-action="remove"
                data-name="${encodeURIComponent(item.name)}"
              >
                Remove
              </button>

            </div>


            <strong>

              ${money(
                item.price *
                item.qty
              )}

            </strong>

          </div>

        `).join("")

      : `

        <div class="empty-cart">

          Your cart is empty.

          <br>

          Add something delicious
          from the menu.

        </div>

      `;


    cartItems
      .querySelectorAll(
        "[data-action]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const name =
                decodeURIComponent(
                  button.dataset.name
                );


              if(
                button.dataset.action ===
                "plus"
              ){

                changeQty(
                  name,
                  1
                );

              }


              if(
                button.dataset.action ===
                "minus"
              ){

                changeQty(
                  name,
                  -1
                );

              }


              if(
                button.dataset.action ===
                "remove"
              ){

                removeItem(name);

              }

            }
          );

        }
      );

  }

}


/* =========================================================
   CART NAVIGATION
========================================================= */

function openCart(){

  window.location.href =
    "cart.html";

}


function closeCart(){

  const drawer =
    $("#cartDrawer");

  const overlay =
    $("#overlay");


  if(drawer){

    drawer.classList.remove(
      "open"
    );

    drawer.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  if(overlay){

    overlay.classList.remove(
      "show"
    );

  }


  document.body.style.overflow =
    "";

}


/* =========================================================
   DATE SETUP
========================================================= */

function setupDate(){

  const scheduleDate =
    $("#scheduleDate");


  if(!scheduleDate){

    return;

  }


  const date =
    new Date();


  const local =
    new Date(

      date.getTime() -

      date.getTimezoneOffset() *
      60000

    )

      .toISOString()

      .split("T")[0];


  scheduleDate.min =
    local;

}


/* =========================================================
   BUILD ORDER
========================================================= */

function buildOrder(){

  if(!cart.length){

    return {

      error:
        "Please add at least one item to your cart."

    };

  }


  const customerName =
    $("#customerName");


  const customerPhone =
    $("#customerPhone");


  const deliveryAddress =
    $("#deliveryAddress");


  const deliveryLandmark =
    $("#deliveryLandmark");


  const orderNote =
    $("#orderNote");


  const name =
    customerName
      ? customerName.value.trim()
      : "";


  const phone =
    customerPhone
      ? customerPhone.value.trim()
      : "";


  const address =
    deliveryAddress
      ? deliveryAddress.value.trim()
      : "";


  const landmark =
    deliveryLandmark
      ? deliveryLandmark.value.trim()
      : "";


  const note =
    orderNote
      ? orderNote.value.trim()
      : "";


  if(!name){

    return {

      error:
        "Please enter your name."

    };

  }


  if(
    orderType === "Delivery" &&
    !address
  ){

    return {

      error:
        "Please enter your full delivery address."

    };

  }


  const scheduleModeElement =
    $("#scheduleMode");


  const scheduleDateElement =
    $("#scheduleDate");


  const scheduleTimeElement =
    $("#scheduleTime");


  const scheduleMode =
    scheduleModeElement
      ? scheduleModeElement.value
      : "asap";


  const date =
    scheduleDateElement
      ? scheduleDateElement.value
      : "";


  const time =
    scheduleTimeElement
      ? scheduleTimeElement.value
      : "";


  if(
    scheduleMode === "later" &&
    (!date || !time)
  ){

    return {

      error:
        "Please select both date and time for your scheduled order."

    };

  }


  const {

    subtotal,

    platformFee,

    handlingFee,

    total

  } = totals();


  const items =
    cart
      .map(
        (item, index) =>

          `${index + 1}. ${item.name} × ${item.qty} — ₹${item.price * item.qty}`

      )

      .join("\n");


  const scheduleText =

    scheduleMode === "asap"

      ? "As soon as possible"

      : `${date} at ${time}`;


  const message =

`Hello The Daddy's Cafe! I would like to place an order.

*Customer:* ${name}
*Phone:* ${phone || "Not provided"}
*Order Type:* ${orderType}
*Preferred Time:* ${scheduleText}${orderType === "Delivery" ? `\n*Delivery Address:* ${address}${landmark ? `\n*Landmark:* ${landmark}` : ""}` : ""}

*ORDER ITEMS*
${items}

*Subtotal:* ₹${subtotal}
*Convenience Fee (3%):* ₹${platformFee}
*${orderType === "Delivery" ? "Delivery & Handling" : "Packing & Disposables"}:* ₹${handlingFee}
*Total Paid:* ₹${total}${note ? `\n\n*Special Instructions:* ${note}` : ""}

Prepaid order. Please confirm availability and order acceptance.

Thank you.`;


  return {

    message,

    order: {

      customerName:
        name,

      customerPhone:
        phone || "Not provided",

      orderType,

      scheduleText,

      deliveryAddress:
        orderType === "Delivery"
          ? address
          : "",

      landmark:
        orderType === "Delivery"
          ? landmark
          : "",

      note,

      items:
        cart.map(
          item => ({

            name:
              item.name,

            price:
              item.price,

            qty:
              item.qty,

            lineTotal:
              item.price *
              item.qty

          })
        ),

      subtotal,

      platformFee,

      handlingFee,

      handlingLabel:
        orderType === "Delivery"

          ? "Delivery & Handling"

          : "Packing & Disposables",

      total,

      createdAt:
        new Date().toISOString()

    }

  };

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if($("#whatsappCheckoutBtn")){

  $("#whatsappCheckoutBtn")
    .addEventListener(
      "click",
      () => {

        if(!cart.length){

          alert(
            "Please add at least one item to your cart."
          );

          return;

        }


        window.location.href =
          "cart.html";

      }
    );

}


if($$(".toggle").length){

  $$(".toggle")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            $$(".toggle")
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );


            button.classList.add(
              "active"
            );


            orderType =
              button.dataset.orderType;


            const deliveryPanel =
              $("#deliveryPanel");


            if(deliveryPanel){

              deliveryPanel
                .classList
                .toggle(

                  "hidden",

                  orderType !==
                  "Delivery"

                );

            }


            renderCart();

          }
        );

      }
    );

}


if($("#scheduleMode")){

  $("#scheduleMode")
    .addEventListener(
      "change",
      event => {

        const fields =
          $("#scheduleFields");


        if(fields){

          fields.classList.toggle(

            "hidden",

            event.target.value !==
            "later"

          );

        }

      }
    );

}


if($("#menuSearch")){

  $("#menuSearch")
    .addEventListener(
      "input",
      renderMenu
    );

}


if($("#headerCartBtn")){

  $("#headerCartBtn")
    .addEventListener(
      "click",
      () => {

        window.location.href =
          "cart.html";

      }
    );

}


if($("#mobileCartBar")){

  $("#mobileCartBar")
    .addEventListener(
      "click",
      () => {

        window.location.href =
          "cart.html";

      }
    );

}


if($("#closeCartBtn")){

  $("#closeCartBtn")
    .addEventListener(
      "click",
      closeCart
    );

}


if($("#overlay")){

  $("#overlay")
    .addEventListener(
      "click",
      closeCart
    );

}


document.addEventListener(
  "keydown",
  event => {

    if(event.key === "Escape"){

      closeCart();

    }

  }
);


if($("#year")){

  $("#year").textContent =
    new Date().getFullYear();

}


/* =========================================================
   START APPLICATION
========================================================= */

async function initializeStore(){

  try {

    renderCart();

  } catch(error){

    console.error(
      "Cart badge render error:",
      error
    );

  }


  try {

    await loadMenuFromSupabase();

  } catch(error){

    console.error(
      "Store initialization failed:",
      error
    );


    liveCatalog =
      createFallbackCatalog();


    renderCategories();

    renderMenu();

  }

}


initializeStore();


/* =========================================================
   LIVE STORE AVAILABILITY
========================================================= */
let currentStoreSettings=null;
async function initStoreAvailability(){
  currentStoreSettings=await TDCBusinessHours.load();
  const el=document.getElementById("storeOpenStatus");
  const paint=()=>{const st=TDCBusinessHours.status(currentStoreSettings);if(el){el.className=`store-open-status ${st.open?'open':'closed'}`;el.innerHTML=st.open?`<strong>🟢 ACCEPTING ORDERS</strong><span>${st.message}</span>`:`<strong>🔴 OFFLINE — NOT ACCEPTING ORDERS</strong><span>${st.message} · Menu browsing is still available.</span>`}document.documentElement.dataset.storeOpen=st.open?'true':'false'};
  paint();setInterval(paint,30000);
}
initStoreAvailability();
