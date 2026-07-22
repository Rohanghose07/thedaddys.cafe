
"use strict";

/**
 * The Daddy's Cafe — storefront configuration.
 * WhatsApp number format: country code + number, without "+" or spaces.
 */
const STORE_CONFIG = Object.freeze({
  name: "The Daddy's Cafe",
  city: "Silchar",
  whatsappNumber: "919181333402",
  displayPhone: "(+91) 91813 33402"
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

let cart = JSON.parse(localStorage.getItem("tdcCart") || "[]");
let activeCategory = "All";
let orderType = "Takeaway";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => `₹${n}`;

function saveCart(){ localStorage.setItem("tdcCart", JSON.stringify(cart)); }

function renderCategories(){
  const cats = ["All", ...new Set(menu.map(x=>x.category))];
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
  const filtered = menu.filter(x =>
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
          <article class="menu-card">
            <div class="menu-card-top">
              <div>
                <h3>${x.name}</h3>
                ${x.subcategory ? `<div class="menu-meta">${x.subcategory}</div>` : ""}
              </div>
            </div>
            <div class="menu-card-bottom">
              <span class="price">${money(x.price)}</span>
              <button class="add-btn" data-name="${encodeURIComponent(x.name)}">ADD +</button>
            </div>
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
  const product = menu.find(x=>x.name===name);
  const existing = cart.find(x=>x.name===name);
  existing ? existing.qty++ : cart.push({...product, qty:1});
  saveCart(); renderCart();
  if(window.innerWidth > 760) openCart();
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
  return {
    count: cart.reduce((s,x)=>s+x.qty,0),
    total: cart.reduce((s,x)=>s+(x.price*x.qty),0)
  };
}

function renderCart(){
  const {count,total} = totals();
  $("#headerCartCount").textContent = count;
  $("#mobileCartCount").textContent = `${count} item${count===1?"":"s"}`;
  $("#mobileCartTotal").textContent = money(total);
  $("#cartSubtotal").textContent = money(total);
  $("#mobileCartBar").classList.toggle("visible", count>0);

  $("#cartItems").innerHTML = cart.length ? cart.map(x => `
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

  $$("[data-action]").forEach(btn => btn.addEventListener("click", ()=>{
    const name = decodeURIComponent(btn.dataset.name);
    if(btn.dataset.action==="plus") changeQty(name,1);
    if(btn.dataset.action==="minus") changeQty(name,-1);
    if(btn.dataset.action==="remove") removeItem(name);
  }));
}

function openCart(){
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden","false");
  $("#overlay").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCart(){
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden","true");
  $("#overlay").classList.remove("show");
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

  const {total} = totals();
  const items = cart.map((x,i)=>`${i+1}. ${x.name} × ${x.qty} — ₹${x.price*x.qty}`).join("\n");
  const scheduleText = scheduleMode==="asap" ? "As soon as possible" : `${date} at ${time}`;

  const msg = `Hello The Daddy's Cafe! I would like to place an order.

*Customer:* ${name}
*Phone:* ${phone || "Not provided"}
*Order Type:* ${orderType}
*Preferred Time:* ${scheduleText}${orderType==="Delivery" ? `\n*Delivery Address:* ${address}${landmark ? `\n*Landmark:* ${landmark}` : ""}` : ""}

*ORDER ITEMS*
${items}

*Subtotal:* ₹${total}${note ? `\n\n*Special Instructions:* ${note}` : ""}

Please confirm availability${orderType==="Delivery"?", delivery charge":""} and final payable amount.

Thank you.`;

  return {message:msg};
}

$("#whatsappCheckoutBtn").addEventListener("click", ()=>{
  const result = buildOrder();
  if(result.error){ alert(result.error); return; }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(result.message)}`,"_blank","noopener");
});

$$(".toggle").forEach(btn=>btn.addEventListener("click",()=>{
  $$(".toggle").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  orderType = btn.dataset.orderType;
  $("#deliveryPanel").classList.toggle("hidden",orderType!=="Delivery");
}));

$("#scheduleMode").addEventListener("change",e=>{
  $("#scheduleFields").classList.toggle("hidden",e.target.value!=="later");
});
$("#menuSearch").addEventListener("input",renderMenu);
$("#headerCartBtn").addEventListener("click",openCart);
$("#mobileCartBar").addEventListener("click",openCart);
$("#closeCartBtn").addEventListener("click",closeCart);
$("#overlay").addEventListener("click",closeCart);
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeCart(); });
$("#year").textContent = new Date().getFullYear();

setupDate();
renderCategories();
renderMenu();
renderCart();
