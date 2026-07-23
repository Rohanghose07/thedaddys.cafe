console.log("Supabase client:", window.supabaseClient);

async function testSupabaseConnection() {
  try {
    const { data, error } = await window.supabaseClient
      .from("categories")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Supabase test failed:", error);
      return;
    }

    console.log("Supabase connected successfully:", data);
  } catch (error) {
    console.error("Connection error:", error);
  }
}

testSupabaseConnection();
"use strict";
const BASE_MENU = [
["Starters","Daddy's Crispy Chicken Pakoda (10 Pcs)",130],["Starters","Classic Egg Devil (2 Pcs)",99],["Starters","Cheesy Chicken Balls (6 Pcs)",170],["Gravy Items","Chilli Chicken",160],["Gravy Items","Chicken 65",160],["Gravy Items","Chilli Paneer",130],["Gravy Items","Chilli Baby Corn",120],
["Fried Rice","Veg Fried Rice",70],["Fried Rice","Egg Fried Rice",90],["Fried Rice","Chicken Fried Rice",100],["Fried Rice","Egg Chicken Fried Rice",120],["Fried Rice","Baby Corn Fried Rice",90],["Fried Rice","Veg Schezwan Fried Rice",90],["Fried Rice","Egg Schezwan Fried Rice",110],["Fried Rice","Chicken Schezwan Fried Rice",130],["Fried Rice","Egg Chicken Schezwan Fried Rice",150],["Fried Rice","Baby Corn Schezwan Fried Rice",110],
["Hakka Noodles","Veg Hakka Noodles",70],["Hakka Noodles","Egg Hakka Noodles",90],["Hakka Noodles","Chicken Hakka Noodles",100],["Hakka Noodles","Egg Chicken Hakka Noodles",120],["Hakka Noodles","Baby Corn Hakka Noodles",90],["Hakka Noodles","Veg Schezwan Noodles",90],["Hakka Noodles","Egg Schezwan Noodles",110],["Hakka Noodles","Chicken Schezwan Noodles",130],["Hakka Noodles","Egg Chicken Schezwan Noodles",150],["Hakka Noodles","Baby Corn Schezwan Noodles",110],
["Kolkata Rolls","Paneer Roll",80],["Kolkata Rolls","Egg Roll",70],["Kolkata Rolls","Chicken Roll",100],["Kolkata Rolls","Egg Chicken Roll",120],["Grilled Sandwiches","Corn Sandwich",70],["Grilled Sandwiches","Paneer Sandwich",90],["Grilled Sandwiches","Corn & Paneer Sandwich",110],["Grilled Sandwiches","Chicken Sandwich",130],["Grilled Sandwiches","Chicken & Corn Sandwich",150],
["Momos","Veg Momos (6 Pcs)",40],["Momos","Chicken Momos (6 Pcs)",60],["Momos","Veg Fried Momos (6 Pcs)",70],["Momos","Chicken Fried Momos (6 Pcs)",90],["Momos","Veg Pan Fried Momos (6 Pcs)",90],["Momos","Chicken Pan Fried Momos (6 Pcs)",110],["Maggi","Fried Masala Maggi",50],["Maggi","Cheesy Fried Masala Maggi",80],["Indian Breads","Tawa Roti",10],["Indian Breads","Butter Roti",15],["Indian Breads","Paratha",30],["Indian Breads","Masala Omelette (Double Egg)",60]
].map(([category,name,price])=>({category,name,price}));
const money=n=>`₹${Number(n||0).toLocaleString("en-IN")}`;
const CUSTOM_KEY="tdcCustomMenuItems";
const REMOVED_KEY="tdcRemovedMenuItems";
function getOrders(){return JSON.parse(localStorage.getItem("tdcAdminOrders")||"[]")}
function getOverrides(){return JSON.parse(localStorage.getItem("tdcCatalogOverrides")||"{}")}
function getCustomItems(){try{return JSON.parse(localStorage.getItem(CUSTOM_KEY)||"[]")}catch{return[]}}
function getRemovedItems(){try{return JSON.parse(localStorage.getItem(REMOVED_KEY)||"[]")}catch{return[]}}
function saveCustomItems(items){localStorage.setItem(CUSTOM_KEY,JSON.stringify(items))}
function saveRemovedItems(items){localStorage.setItem(REMOVED_KEY,JSON.stringify([...new Set(items)]))}
function allMenuItems(){const removed=new Set(getRemovedItems());return [...BASE_MENU.map(x=>({...x,custom:false})),...getCustomItems().map(x=>({...x,custom:true}))].filter(x=>!removed.has(x.name))}
function escapeAttr(v){return String(v??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function renderStats(){const o=getOrders(), completed=o.filter(x=>x.orderStatus!=="Cancelled"), sales=completed.reduce((s,x)=>s+Number(x.total||0),0);document.querySelector("#stats").innerHTML=`<div class="stat"><small>Total orders</small><strong>${o.length}</strong></div><div class="stat"><small>Sales recorded</small><strong>${money(sales)}</strong></div><div class="stat"><small>Average order value</small><strong>${money(completed.length?Math.round(sales/completed.length):0)}</strong></div><div class="stat"><small>Open orders</small><strong>${o.filter(x=>!["Completed","Cancelled"].includes(x.orderStatus)).length}</strong></div>`}
function renderOrders(){const filter=document.querySelector("#orderFilter").value;const orders=getOrders().filter(o=>filter==="All"||o.orderStatus===filter);document.querySelector("#ordersList").innerHTML=orders.length?orders.map((o,i)=>`<article class="order"><div class="order-head"><div><strong>${o.invoiceNumber||"Order"}</strong><p>${o.customerName} • ${o.customerPhone}</p></div><span class="badge">${o.orderStatus||"Paid"}</span></div><div class="order-items">${(o.items||[]).map(x=>`${x.qty} × ${x.name}`).join("<br>")}</div><p>${o.orderType} • ${o.scheduleText||"ASAP"} • Total ${money(o.total)}</p><select data-order="${i}" data-id="${o.invoiceNumber||o.paymentId}">${["Paid","Preparing","Ready","Out for Delivery","Completed","Cancelled"].map(s=>`<option ${s===(o.orderStatus||"Paid")?"selected":""}>${s}</option>`).join("")}</select></article>`).join(""):`<div class="order">No orders in this view yet.</div>`;document.querySelectorAll("[data-id]").forEach(sel=>sel.onchange=()=>{const all=getOrders();const target=all.find(x=>(x.invoiceNumber||x.paymentId)===sel.dataset.id);if(target)target.orderStatus=sel.value;localStorage.setItem("tdcAdminOrders",JSON.stringify(all));renderStats();renderOrders()})}
function renderCategoryOptions(){const dl=document.querySelector("#categoryOptions");if(dl)dl.innerHTML=[...new Set(allMenuItems().map(x=>x.category))].sort().map(c=>`<option value="${escapeAttr(c)}"></option>`).join("")}
function renderInventory(){
 const ov=getOverrides(), items=allMenuItems();
 document.querySelector("#inventoryList").innerHTML=items.length?items.map((x,i)=>{const o=ov[x.name]||{};return `<article class="item"><div><div class="item-head"><div><strong>${x.name}</strong><div class="badge">${x.category}${x.custom?' • Custom':''}</div></div><strong>${money(x.price)}</strong></div></div><div class="item-fields"><input id="d${i}" placeholder="Short description" value="${escapeAttr(o.description||x.description||"")}"><input id="s${i}" type="number" min="0" value="${Number.isFinite(Number(o.stock))?o.stock:(Number.isFinite(Number(x.stock))?x.stock:999)}" title="Stock"><label class="switch"><input id="a${i}" type="checkbox" ${o.available!==false&&x.available!==false?"checked":""}> Available</label><textarea id="t${i}" placeholder="Detailed item description">${escapeAttr(o.description||x.description||"")}</textarea><input id="p${i}" type="url" placeholder="Food image URL (https://...)" value="${escapeAttr(o.image||x.image||"")}"><label class="switch"><input id="b${i}" type="checkbox" ${(o.bestseller===true||x.bestseller===true)?"checked":""}> Bestseller</label><div class="item-actions"><button class="save" data-save="${i}">Save item</button><button class="delete-item" data-delete="${i}">Remove item</button></div></div></article>`}).join(""):`<div class="order">No menu items. Use “Add New Item” above.</div>`;
 document.querySelectorAll("[data-save]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.save),x=items[i],all=getOverrides();all[x.name]={...(all[x.name]||{}),description:document.querySelector(`#t${i}`).value.trim()||document.querySelector(`#d${i}`).value.trim(),stock:Number(document.querySelector(`#s${i}`).value),available:document.querySelector(`#a${i}`).checked,image:document.querySelector(`#p${i}`).value.trim(),bestseller:document.querySelector(`#b${i}`).checked};localStorage.setItem("tdcCatalogOverrides",JSON.stringify(all));b.textContent="Saved ✓";setTimeout(()=>b.textContent="Save item",1200)});
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{const x=items[Number(b.dataset.delete)];if(!confirm(`Remove “${x.name}” from the customer menu?`))return;if(x.custom){saveCustomItems(getCustomItems().filter(i=>i.name!==x.name));}else{saveRemovedItems([...getRemovedItems(),x.name]);}const all=getOverrides();delete all[x.name];localStorage.setItem("tdcCatalogOverrides",JSON.stringify(all));renderInventory();renderCategoryOptions()});
 renderCategoryOptions();
}
function addNewItem(){
 const name=document.querySelector("#newName").value.trim(), category=document.querySelector("#newCategory").value.trim(), price=Number(document.querySelector("#newPrice").value), stock=Number(document.querySelector("#newStock").value||999), msg=document.querySelector("#addItemMessage");
 msg.textContent="";
 if(!name||!category||!Number.isFinite(price)||price<=0){msg.textContent="Enter item name, category and a valid price.";return}
 if(allMenuItems().some(x=>x.name.toLowerCase()===name.toLowerCase())){msg.textContent="An item with this name already exists.";return}
 const item={id:`custom-${Date.now()}`,name,category,price:Math.round(price),description:document.querySelector("#newDescription").value.trim(),image:document.querySelector("#newImage").value.trim(),stock:Number.isFinite(stock)&&stock>=0?stock:999,available:document.querySelector("#newAvailable").checked,bestseller:document.querySelector("#newBestseller").checked,custom:true};
 saveCustomItems([...getCustomItems(),item]);
 const ov=getOverrides();ov[item.name]={description:item.description,image:item.image,stock:item.stock,available:item.available,bestseller:item.bestseller};localStorage.setItem("tdcCatalogOverrides",JSON.stringify(ov));
 ["newName","newPrice","newCategory","newDescription","newImage"].forEach(id=>document.querySelector(`#${id}`).value="");document.querySelector("#newStock").value="999";document.querySelector("#newAvailable").checked=true;document.querySelector("#newBestseller").checked=false;msg.textContent=`${name} added to the menu ✓`;renderInventory();
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelector(`#${b.dataset.tab}`).classList.add("active")});
document.querySelector("#orderFilter").onchange=renderOrders;
document.querySelector("#addNewItem").onclick=addNewItem;
document.querySelector("#resetCatalog").onclick=()=>{if(confirm("Reset all local menu changes, including added and removed items?")){localStorage.removeItem("tdcCatalogOverrides");localStorage.removeItem(CUSTOM_KEY);localStorage.removeItem(REMOVED_KEY);renderInventory()}};
renderStats();renderOrders();renderInventory();

const PROMO_KEY="tdcPromos";
function getPromos(){try{return JSON.parse(localStorage.getItem(PROMO_KEY)||"[]")}catch{return[]}}
function setPromos(x){localStorage.setItem(PROMO_KEY,JSON.stringify(x));renderPromos()}
function renderPromos(){
 const box=document.querySelector("#promoList");if(!box)return;const ps=getPromos();
 box.innerHTML=ps.length?ps.map((p,i)=>`<article class="inventory-row"><div><strong>${p.code}</strong><small>${p.audience==="all"?"All Users • reusable":p.audience==="new"?"New Users Only":"Special • once per number"} • ${p.discountType==="percent"?p.value+"%":"₹"+p.value} off${p.minOrder?` • Min ₹${p.minOrder}`:""}${p.validUntil?` • Until ${p.validUntil}`:""}</small></div><div class="inventory-actions"><label class="switch"><input type="checkbox" data-pactive="${i}" ${p.active!==false?"checked":""}> Active</label><button data-pdelete="${i}" class="danger">Delete</button></div></article>`).join(""):"<p>No promo codes created yet.</p>";
 box.querySelectorAll("[data-pactive]").forEach(x=>x.onchange=()=>{const a=getPromos();a[+x.dataset.pactive].active=x.checked;setPromos(a)});
 box.querySelectorAll("[data-pdelete]").forEach(x=>x.onclick=()=>{if(confirm("Delete this promo?")){const a=getPromos();a.splice(+x.dataset.pdelete,1);setPromos(a)}});
}
document.querySelector("#savePromo").onclick=()=>{
 const code=document.querySelector("#promoCode").value.trim().toUpperCase(),value=Number(document.querySelector("#promoValue").value),msg=document.querySelector("#promoAdminMsg");if(!code||!value){msg.textContent="Enter a promo code and discount value.";return}
 let ps=getPromos();if(ps.some(p=>p.code===code)){msg.textContent="This promo code already exists.";return}
 ps.unshift({code,audience:document.querySelector("#promoAudience").value,discountType:document.querySelector("#promoDiscountType").value,value,minOrder:Number(document.querySelector("#promoMinOrder").value||0),maxDiscount:Number(document.querySelector("#promoMaxDiscount").value||0),validFrom:document.querySelector("#promoFrom").value,validUntil:document.querySelector("#promoUntil").value,usageLimit:Number(document.querySelector("#promoUsageLimit").value||0),used:0,active:document.querySelector("#promoActive").checked});
 setPromos(ps);msg.textContent=`${code} saved ✓`;document.querySelector("#promoCode").value="";document.querySelector("#promoValue").value="";
};
renderPromos();
