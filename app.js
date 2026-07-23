
"use strict";

/**
 * The Daddy's Cafe — storefront configuration.
 * WhatsApp number format: country code + number, without "+" or spaces.
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

const menu = [
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

let cart = [];
try {
  const savedCart = JSON.parse(localStorage.getItem("tdcCart") || "[]");
  cart = Array.isArray(savedCart) ? savedCart : [];
} catch {
  cart = [];
  localStorage.removeItem("tdcCart");
}
let activeCategory = "All";
let orderType = "Takeaway";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => `₹${n}`;

const CATEGORY_IMAGE = {
  "Starters":"🍗", "Gravy Items":"🍲", "Fried Rice":"🍚", "Hakka Noodles":"🍜",
  "Kolkata Rolls":"🌯", "Grilled Sandwiches":"🥪", "Momos":"🥟", "Maggi":"🍝", "Indian Breads":"🫓"
};

function defaultDescription(item){
  const name = item.name.toLowerCase();
  if(name.includes("fried rice")) return "Wok-tossed rice prepared fresh with aromatic seasoning and classic Indo-Chinese flavours.";
  if(name.includes("noodles")) return "Freshly wok-tossed noodles with vegetables, seasoning and bold Indo-Chinese flavour.";
  if(name.includes("roll")) return "Fresh Kolkata-style roll wrapped in a soft paratha with flavourful filling and house seasoning.";
  if(name.includes("momo")) return "Juicy dumplings prepared fresh and served with a punchy house-style accompaniment.";
  if(name.includes("sandwich")) return "Freshly grilled sandwich with a crisp exterior and a generous savoury filling.";
  if(name.includes("maggi")) return "Comforting masala noodles tossed hot and fresh for a quick, flavour-packed bite.";
  if(name.includes("chilli") || name.includes("65")) return "Bold Indo-Chinese preparation with a savoury, spicy and satisfying finish.";
  if(name.includes("pakoda") || name.includes("balls") || name.includes("devil")) return "Crisp, freshly prepared snack made for sharing or enjoying as a hearty starter.";
  return "Freshly prepared to order with The Daddy's Cafe house-style flavours.";
}

function loadCatalog(){
  let saved = {};
  try {
    const parsed = JSON.parse(localStorage.getItem("tdcCatalogOverrides") || "{}");
    saved = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    saved = {};
    localStorage.removeItem("tdcCatalogOverrides");
  }
  let custom = [], removed = [];
  try { custom = JSON.parse(localStorage.getItem("tdcCustomMenuItems") || "[]"); } catch {}
  try { removed = JSON.parse(localStorage.getItem("tdcRemovedMenuItems") || "[]"); } catch {}
  const removedSet = new Set(removed);
  const combined = [...menu.map((x,i)=>({...x,id:`item-${i+1}`,custom:false})), ...custom.map((x,i)=>({...x,id:x.id||`custom-${i+1}`,custom:true}))];
  return combined.filter(item=>!removedSet.has(item.name)).map((item, index)=>{
    const o=saved[item.name] || {};
    return {...item, id:o.id || item.id || `item-${index+1}`, description:o.description || item.description || defaultDescription(item), image:o.image || item.image || "", stock:Number.isFinite(Number(o.stock))?Number(o.stock):(Number.isFinite(Number(item.stock))?Number(item.stock):999), available:o.available!==false && item.available!==false, bestseller:o.bestseller===true || item.bestseller===true};
  });
}

function saveCart(){ localStorage.setItem("tdcCart", JSON.stringify(cart)); }

function renderCategories(){
  const cats = ["All", ...new Set(loadCatalog().map(x=>x.category))];
  $("#categoryTabs").innerHTML = cats.map(c =>
    `<button class="category-tab ${c===activeCategory?"active":""}" data-cat="${c}">${c}</button>`
  ).join("");
  $$(".category-tab").forEach(btn => btn.addEventListener("click", () => {
    activeCategory = btn.dataset.cat;
    renderCategories();
    renderMenu();
  }));
}

function renderMenu(){
  const q = $("#menuSearch").value.trim().toLowerCase();
  const filtered = loadCatalog().filter(x =>
    (activeCategory==="All" || x.category===activeCategory) &&
    (!q || `${x.name} ${x.category} ${x.subcategory||""}`.toLowerCase().includes(q))
  );

  if(!filtered.length){
    $("#menuGrid").innerHTML = `<div class="empty-cart">No dishes match your search.</div>`;
    return;
  }

  const grouped = filtered.reduce((groups, item) => {
    if(!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});

  $("#menuGrid").innerHTML = Object.entries(grouped).map(([category, items]) => `
    <section class="menu-category-section">
      <div class="menu-category-heading">
        <div>
          <span class="category-line"></span>
          <h3>${category}</h3>
        </div>
        <span class="category-count">${items.length} item${items.length===1?"":"s"}</span>
      </div>

      <div class="category-items-grid">
        ${items.map(x => `
          <article class="menu-card food-card ${!x.available || x.stock<=0 ? "sold-out" : ""}">
            <div class="food-copy">
              <div class="menu-card-top">
                <div>
                  <div class="food-tags">${x.bestseller ? '<span class="bestseller-tag">★ Bestseller</span>' : ''}${x.subcategory ? `<span class="menu-meta">${x.subcategory}</span>` : ""}</div>
                  <h3>${x.name}</h3>
                  <p class="food-description">${x.description}</p>
                </div>
              </div>
              <div class="menu-card-bottom">
                <span class="price">${money(x.price)}</span>
                <button class="add-btn" data-name="${encodeURIComponent(x.name)}" ${!x.available || x.stock<=0 ? "disabled" : ""}>${!x.available || x.stock<=0 ? "SOLD OUT" : "ADD +"}</button>
              </div>
            </div>
            <div class="food-image-wrap">${x.image ? `<img src="${x.image}" alt="${x.name}" loading="lazy">` : `<div class="food-image-placeholder"><span>${CATEGORY_IMAGE[x.category] || "🍽️"}</span><small>Add photo in Admin</small></div>`}</div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");

  $$(".add-btn").forEach(btn =>
    btn.addEventListener("click", () =>
      addItem(decodeURIComponent(btn.dataset.name))
    )
  );
}

function addItem(name){
  const product = loadCatalog().find(x=>x.name===name);
  if(!product || !product.available || product.stock<=0){ alert("This item is currently unavailable."); return; }
  const existing = cart.find(x=>x.name===name);
  existing ? existing.qty++ : cart.push({...product, qty:1});
  saveCart(); renderCart();

}

function changeQty(name, delta){
  const line = cart.find(x=>x.name===name);
  if(!line) return;
  line.qty += delta;
  if(line.qty<=0) cart = cart.filter(x=>x.name!==name);
  saveCart(); renderCart();
}

function removeItem(name){
  cart = cart.filter(x=>x.name!==name);
  saveCart(); renderCart();
}

function totals(){
  const subtotal = cart.reduce((s,x)=>s+(x.price*x.qty),0);
  const platformFee = cart.length ? Math.round(subtotal * 0.03) : 0;
  const handlingFee = cart.length ? (orderType === "Delivery" ? 40 : 15) : 0;
  return {
    count: cart.reduce((s,x)=>s+x.qty,0),
    subtotal,
    platformFee,
    handlingFee,
    total: subtotal + platformFee + handlingFee
  };
}

function renderCart(){
  const {count,subtotal,platformFee,handlingFee,total} = totals();

  const headerCartCount = $("#headerCartCount");
  if(headerCartCount) headerCartCount.textContent = count;

  const mobileCartCount = $("#mobileCartCount");
  if(mobileCartCount) mobileCartCount.textContent = `${count} item${count===1?"":"s"}`;

  const mobileCartTotal = $("#mobileCartTotal");
  if(mobileCartTotal) mobileCartTotal.textContent = money(total);

  const cartSubtotal = $("#cartSubtotal");
  if(cartSubtotal) cartSubtotal.textContent = money(subtotal);

  const cartPlatformFee = $("#cartPlatformFee");
  if(cartPlatformFee) cartPlatformFee.textContent = money(platformFee);

  const cartFeeLabel = $("#cartFeeLabel");
  if(cartFeeLabel) cartFeeLabel.textContent = orderType === "Delivery" ? "Delivery & Handling" : "Packing & Disposables";

  const cartHandlingFee = $("#cartHandlingFee");
  if(cartHandlingFee) cartHandlingFee.textContent = money(handlingFee);

  const cartGrandTotal = $("#cartGrandTotal");
  if(cartGrandTotal) cartGrandTotal.textContent = money(total);

  const mobileCartBar = $("#mobileCartBar");
  if(mobileCartBar) mobileCartBar.classList.toggle("visible", count>0);

  const cartItems = $("#cartItems");
  if(cartItems){
    cartItems.innerHTML = cart.length ? cart.map(x => `
      <div class="cart-line">
        <div>
          <h4>${x.name}</h4>
          <small>${money(x.price)} each</small>
          <div class="qty">
            <button data-action="minus" data-name="${encodeURIComponent(x.name)}">−</button>
            <strong>${x.qty}</strong>
            <button data-action="plus" data-name="${encodeURIComponent(x.name)}">+</button>
          </div>
          <button class="remove-btn" data-action="remove" data-name="${encodeURIComponent(x.name)}">Remove</button>
        </div>
        <strong>${money(x.price*x.qty)}</strong>
      </div>`).join("") : `<div class="empty-cart">Your cart is empty.<br>Add something delicious from the menu.</div>`;

    cartItems.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", ()=>{
      const name = decodeURIComponent(btn.dataset.name);
      if(btn.dataset.action==="plus") changeQty(name,1);
      if(btn.dataset.action==="minus") changeQty(name,-1);
      if(btn.dataset.action==="remove") removeItem(name);
    }));
  }
}

function openCart(){
  window.location.href = "cart.html";
}
function closeCart(){
  const drawer = $("#cartDrawer");
  const overlay = $("#overlay");
  if(drawer){
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
  }
  if(overlay) overlay.classList.remove("show");
  document.body.style.overflow = "";
}

function setupDate(){
  const d = new Date();
  const local = new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().split("T")[0];
  $("#scheduleDate").min = local;
}

function buildOrder(){
  if(!cart.length) return {error:"Please add at least one item to your cart."};
  const name = $("#customerName").value.trim();
  const phone = $("#customerPhone").value.trim();
  const address = $("#deliveryAddress").value.trim();
  const landmark = $("#deliveryLandmark") ? $("#deliveryLandmark").value.trim() : "";
  const note = $("#orderNote").value.trim();
  if(!name) return {error:"Please enter your name."};
  if(orderType==="Delivery" && !address) return {error:"Please enter your full delivery address."};

  const scheduleMode = $("#scheduleMode").value;
  const date = $("#scheduleDate").value;
  const time = $("#scheduleTime").value;
  if(scheduleMode==="later" && (!date || !time)) return {error:"Please select both date and time for your scheduled order."};

  const {subtotal,platformFee,handlingFee,total} = totals();
  const items = cart.map((x,i)=>`${i+1}. ${x.name} × ${x.qty} — ₹${x.price*x.qty}`).join("\n");
  const scheduleText = scheduleMode==="asap" ? "As soon as possible" : `${date} at ${time}`;

  const msg = `Hello The Daddy's Cafe! I would like to place an order.

*Customer:* ${name}
*Phone:* ${phone || "Not provided"}
*Order Type:* ${orderType}
*Preferred Time:* ${scheduleText}${orderType==="Delivery" ? `\n*Delivery Address:* ${address}${landmark ? `\n*Landmark:* ${landmark}` : ""}` : ""}

*ORDER ITEMS*
${items}

*Subtotal:* ₹${subtotal}
*Convenience Fee (3%):* ₹${platformFee}
*${orderType === "Delivery" ? "Delivery & Handling" : "Packing & Disposables"}:* ₹${handlingFee}
*Total Paid:* ₹${total}${note ? `\n\n*Special Instructions:* ${note}` : ""}

Prepaid order. Please confirm availability and order acceptance.

Thank you.`;

  return {
    message: msg,
    order: {
      customerName: name,
      customerPhone: phone || "Not provided",
      orderType,
      scheduleText,
      deliveryAddress: orderType === "Delivery" ? address : "",
      landmark: orderType === "Delivery" ? landmark : "",
      note,
      items: cart.map(x => ({name:x.name, price:x.price, qty:x.qty, lineTotal:x.price*x.qty})),
      subtotal,
      platformFee,
      handlingFee,
      handlingLabel: orderType === "Delivery" ? "Delivery & Handling" : "Packing & Disposables",
      total,
      createdAt: new Date().toISOString()
    }
  };
}

if($("#whatsappCheckoutBtn")) $("#whatsappCheckoutBtn").addEventListener("click", ()=>{
  if(!cart.length){ alert("Please add at least one item to your cart."); return; }
  window.location.href = "cart.html";
});

if($$(".toggle").length) $$(".toggle").forEach(btn=>btn.addEventListener("click",()=>{
  $$(".toggle").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  orderType = btn.dataset.orderType;
  $("#deliveryPanel").classList.toggle("hidden",orderType!=="Delivery");
  renderCart();
}));

if($("#scheduleMode")) $("#scheduleMode").addEventListener("change",e=>{
  $("#scheduleFields").classList.toggle("hidden",e.target.value!=="later");
});
if($("#menuSearch")) $("#menuSearch").addEventListener("input",renderMenu);
if($("#headerCartBtn")) $("#headerCartBtn").addEventListener("click",()=>{ window.location.href="cart.html"; });
if($("#mobileCartBar")) $("#mobileCartBar").addEventListener("click",()=>{ window.location.href="cart.html"; });
if($("#closeCartBtn")) $("#closeCartBtn").addEventListener("click",closeCart);
if($("#overlay")) $("#overlay").addEventListener("click",closeCart);
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeCart(); });
if($("#year")) $("#year").textContent = new Date().getFullYear();

try {
  renderCategories();
  renderMenu();
} catch (error) {
  console.error("Menu render error:", error);
  if($("#menuGrid")) {
    $("#menuGrid").innerHTML = '<div class="empty-cart">Menu could not load. Please refresh the page.</div>';
  }
}

try {
  renderCart();
} catch (error) {
  console.error("Cart badge render error:", error);
}
