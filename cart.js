
"use strict";
let cart=JSON.parse(localStorage.getItem("tdcCart")||"[]");
const money=n=>`₹${Math.round(Number(n)||0)}`;
function save(){localStorage.setItem("tdcCart",JSON.stringify(cart));render()}
function render(){
 const box=document.querySelector("#cartPageItems");
 if(!cart.length){box.innerHTML='<p>Your cart is empty.</p>';document.querySelector("#checkoutLink").style.display="none";}
 else box.innerHTML=cart.map((x,i)=>`<div class="flow-item">${x.image?`<img class="flow-thumb" src="${x.image}">`:`<div class="flow-thumb flow-placeholder">🍽️</div>`}<div><h3>${x.name}</h3><p>${money(x.price)} each</p><div class="flow-qty"><button data-i="${i}" data-d="-1">−</button><strong>${x.qty}</strong><button data-i="${i}" data-d="1">+</button><button data-r="${i}" style="width:auto;border-radius:10px;padding:0 10px">Remove</button></div></div><strong>${money(x.price*x.qty)}</strong></div>`).join("");
 const sub=cart.reduce((s,x)=>s+x.price*x.qty,0);document.querySelector("#sub").textContent=money(sub);document.querySelector("#total").textContent=money(sub);
 document.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;cart[i].qty+=+b.dataset.d;if(cart[i].qty<=0)cart.splice(i,1);save()});
 document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.r,1);save()});
}
render();
