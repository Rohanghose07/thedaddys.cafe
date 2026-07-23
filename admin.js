"use strict";

/* =========================================================
   SUPABASE ADMIN AUTH
========================================================= */

const supabaseClient = window.supabaseClient;

const adminLoginGate = document.getElementById("adminLoginGate");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPass = document.getElementById("adminPass");
const adminLoginError = document.getElementById("adminLoginError");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

const dashboardHeader = document.querySelector("header");
const dashboardMain = document.querySelector("main");


function setAdminUi(loggedIn) {

  if (adminLoginGate) {
    adminLoginGate.style.display =
      loggedIn ? "none" : "flex";
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.style.display =
      loggedIn ? "block" : "none";
  }

  if (dashboardHeader) {
    dashboardHeader.style.display =
      loggedIn ? "" : "none";
  }

  if (dashboardMain) {
    dashboardMain.style.display =
      loggedIn ? "" : "none";
  }

}


/* =========================================================
   VERIFY ADMIN UUID
========================================================= */

async function verifyAdmin(userId) {

  try {

    const { data, error } =
      await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {

      console.error(
        "Admin verification failed:",
        error
      );

      return false;

    }

    return Boolean(data);

  } catch (error) {

    console.error(
      "Admin verification exception:",
      error
    );

    return false;

  }

}


/* =========================================================
   CHECK CURRENT SESSION
========================================================= */

async function checkAdminSession() {

  try {

    const {
      data: { session },
      error
    } =
      await supabaseClient
        .auth
        .getSession();

    if (error) {

      console.error(
        "Session check failed:",
        error
      );

      setAdminUi(false);

      return;

    }


    if (!session) {

      setAdminUi(false);

      return;

    }


    const isAdmin =
      await verifyAdmin(
        session.user.id
      );


    if (!isAdmin) {

      await supabaseClient
        .auth
        .signOut();

      if (adminLoginError) {

        adminLoginError.textContent =
          "This account is not authorised to access the admin dashboard.";

      }

      setAdminUi(false);

      return;

    }


    setAdminUi(true);


  } catch (error) {

    console.error(
      "Session verification error:",
      error
    );

    setAdminUi(false);

  }

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

if (adminLoginForm) {

  adminLoginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const email =
        adminEmail
          ? adminEmail.value.trim()
          : "";

      const password =
        adminPass
          ? adminPass.value
          : "";


      if (!email || !password) {

        if (adminLoginError) {

          adminLoginError.textContent =
            "Please enter your email and password.";

        }

        return;

      }


      const loginButton =
        adminLoginForm.querySelector(
          'button[type="submit"]'
        );


      if (loginButton) {

        loginButton.disabled = true;
        loginButton.textContent =
          "SIGNING IN...";

      }


      if (adminLoginError) {

        adminLoginError.textContent =
          "Signing in...";

      }


      try {

        const {
          data,
          error
        } =
          await supabaseClient
            .auth
            .signInWithPassword({

              email,
              password

            });


        if (error) {

          if (adminLoginError) {

            adminLoginError.textContent =
              error.message;

          }

          return;

        }


        if (!data.user) {

          if (adminLoginError) {

            adminLoginError.textContent =
              "Login failed.";

          }

          return;

        }


        const isAdmin =
          await verifyAdmin(
            data.user.id
          );


        if (!isAdmin) {

          await supabaseClient
            .auth
            .signOut();


          if (adminLoginError) {

            adminLoginError.textContent =
              "This account is not authorised as an admin.";

          }


          setAdminUi(false);

          return;

        }


        if (adminLoginError) {

          adminLoginError.textContent =
            "";

        }


        if (adminPass) {

          adminPass.value = "";

        }


        setAdminUi(true);


      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        if (adminLoginError) {

          adminLoginError.textContent =
            "Unable to sign in. Please try again.";

        }


      } finally {

        if (loginButton) {

          loginButton.disabled = false;
          loginButton.textContent =
            "LOGIN";

        }

      }

    }
  );

}


/* =========================================================
   ADMIN LOGOUT
========================================================= */

if (adminLogoutBtn) {

  adminLogoutBtn.addEventListener(
    "click",
    async function () {

      try {

        await supabaseClient
          .auth
          .signOut();

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }


      if (adminPass) {

        adminPass.value = "";

      }


      if (adminLoginError) {

        adminLoginError.textContent =
          "";

      }


      setAdminUi(false);

    }
  );

}


/* =========================================================
   OPTIONAL AUTH STATE LISTENER
========================================================= */

supabaseClient
  .auth
  .onAuthStateChange(
    async (event, session) => {

      if (
        event === "SIGNED_OUT" ||
        !session
      ) {

        setAdminUi(false);

      }

    }
  );


/* =========================================================
   EXISTING MENU DATA
========================================================= */

const BASE_MENU = [

  [
    "Starters",
    "Daddy's Crispy Chicken Pakoda (10 Pcs)",
    130
  ],

  [
    "Starters",
    "Classic Egg Devil (2 Pcs)",
    99
  ],

  [
    "Starters",
    "Cheesy Chicken Balls (6 Pcs)",
    170
  ],

  [
    "Gravy Items",
    "Chilli Chicken",
    160
  ],

  [
    "Gravy Items",
    "Chicken 65",
    160
  ],

  [
    "Gravy Items",
    "Chilli Paneer",
    130
  ],

  [
    "Gravy Items",
    "Chilli Baby Corn",
    120
  ],


  [
    "Fried Rice",
    "Veg Fried Rice",
    70
  ],

  [
    "Fried Rice",
    "Egg Fried Rice",
    90
  ],

  [
    "Fried Rice",
    "Chicken Fried Rice",
    100
  ],

  [
    "Fried Rice",
    "Egg Chicken Fried Rice",
    120
  ],

  [
    "Fried Rice",
    "Baby Corn Fried Rice",
    90
  ],

  [
    "Fried Rice",
    "Veg Schezwan Fried Rice",
    90
  ],

  [
    "Fried Rice",
    "Egg Schezwan Fried Rice",
    110
  ],

  [
    "Fried Rice",
    "Chicken Schezwan Fried Rice",
    130
  ],

  [
    "Fried Rice",
    "Egg Chicken Schezwan Fried Rice",
    150
  ],

  [
    "Fried Rice",
    "Baby Corn Schezwan Fried Rice",
    110
  ],


  [
    "Hakka Noodles",
    "Veg Hakka Noodles",
    70
  ],

  [
    "Hakka Noodles",
    "Egg Hakka Noodles",
    90
  ],

  [
    "Hakka Noodles",
    "Chicken Hakka Noodles",
    100
  ],

  [
    "Hakka Noodles",
    "Egg Chicken Hakka Noodles",
    120
  ],

  [
    "Hakka Noodles",
    "Baby Corn Hakka Noodles",
    90
  ],

  [
    "Hakka Noodles",
    "Veg Schezwan Noodles",
    90
  ],

  [
    "Hakka Noodles",
    "Egg Schezwan Noodles",
    110
  ],

  [
    "Hakka Noodles",
    "Chicken Schezwan Noodles",
    130
  ],

  [
    "Hakka Noodles",
    "Egg Chicken Schezwan Noodles",
    150
  ],

  [
    "Hakka Noodles",
    "Baby Corn Schezwan Noodles",
    110
  ],


  [
    "Kolkata Rolls",
    "Paneer Roll",
    80
  ],

  [
    "Kolkata Rolls",
    "Egg Roll",
    70
  ],

  [
    "Kolkata Rolls",
    "Chicken Roll",
    100
  ],

  [
    "Kolkata Rolls",
    "Egg Chicken Roll",
    120
  ],


  [
    "Grilled Sandwiches",
    "Corn Sandwich",
    70
  ],

  [
    "Grilled Sandwiches",
    "Paneer Sandwich",
    90
  ],

  [
    "Grilled Sandwiches",
    "Corn & Paneer Sandwich",
    110
  ],

  [
    "Grilled Sandwiches",
    "Chicken Sandwich",
    130
  ],

  [
    "Grilled Sandwiches",
    "Chicken & Corn Sandwich",
    150
  ],


  [
    "Momos",
    "Veg Momos (6 Pcs)",
    40
  ],

  [
    "Momos",
    "Chicken Momos (6 Pcs)",
    60
  ],

  [
    "Momos",
    "Veg Fried Momos (6 Pcs)",
    70
  ],

  [
    "Momos",
    "Chicken Fried Momos (6 Pcs)",
    90
  ],

  [
    "Momos",
    "Veg Pan Fried Momos (6 Pcs)",
    90
  ],

  [
    "Momos",
    "Chicken Pan Fried Momos (6 Pcs)",
    110
  ],


  [
    "Maggi",
    "Fried Masala Maggi",
    50
  ],

  [
    "Maggi",
    "Cheesy Fried Masala Maggi",
    80
  ],


  [
    "Indian Breads",
    "Tawa Roti",
    10
  ],

  [
    "Indian Breads",
    "Butter Roti",
    15
  ],

  [
    "Indian Breads",
    "Paratha",
    30
  ],

  [
    "Indian Breads",
    "Masala Omelette (Double Egg)",
    60
  ]

].map(
  ([category, name, price]) => ({
    category,
    name,
    price
  })
);


/* =========================================================
   HELPERS
========================================================= */

const money =
  (n) =>
    `₹${Number(n || 0)
      .toLocaleString("en-IN")}`;


const CUSTOM_KEY =
  "tdcCustomMenuItems";

const REMOVED_KEY =
  "tdcRemovedMenuItems";

const PROMO_KEY =
  "tdcPromos";


function safeJson(key, fallback) {

  try {

    return JSON.parse(
      localStorage.getItem(key) ||
      JSON.stringify(fallback)
    );

  } catch {

    return fallback;

  }

}


function getOrders() {

  return safeJson(
    "tdcAdminOrders",
    []
  );

}


function getOverrides() {

  return safeJson(
    "tdcCatalogOverrides",
    {}
  );

}


function getCustomItems() {

  return safeJson(
    CUSTOM_KEY,
    []
  );

}


function getRemovedItems() {

  return safeJson(
    REMOVED_KEY,
    []
  );

}


function saveCustomItems(items) {

  localStorage.setItem(
    CUSTOM_KEY,
    JSON.stringify(items)
  );

}


function saveRemovedItems(items) {

  localStorage.setItem(

    REMOVED_KEY,

    JSON.stringify(
      [...new Set(items)]
    )

  );

}


function allMenuItems() {

  const removed =
    new Set(
      getRemovedItems()
    );


  return [

    ...BASE_MENU.map(
      (x) => ({
        ...x,
        custom: false
      })
    ),

    ...getCustomItems().map(
      (x) => ({
        ...x,
        custom: true
      })
    )

  ].filter(
    (x) =>
      !removed.has(x.name)
  );

}


function escapeAttr(v) {

  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

  const statsBox =
    document.querySelector("#stats");

  if (!statsBox) return;


  const orders =
    getOrders();


  const completed =
    orders.filter(
      (x) =>
        x.orderStatus !==
        "Cancelled"
    );


  const sales =
    completed.reduce(

      (sum, x) =>
        sum +
        Number(x.total || 0),

      0

    );


  const average =
    completed.length
      ? Math.round(
          sales /
          completed.length
        )
      : 0;


  const openOrders =
    orders.filter(
      (x) =>
        ![
          "Completed",
          "Cancelled"
        ].includes(
          x.orderStatus
        )
    ).length;


  statsBox.innerHTML = `

    <div class="stat">

      <small>
        Total orders
      </small>

      <strong>
        ${orders.length}
      </strong>

    </div>


    <div class="stat">

      <small>
        Sales recorded
      </small>

      <strong>
        ${money(sales)}
      </strong>

    </div>


    <div class="stat">

      <small>
        Average order value
      </small>

      <strong>
        ${money(average)}
      </strong>

    </div>


    <div class="stat">

      <small>
        Open orders
      </small>

      <strong>
        ${openOrders}
      </strong>

    </div>

  `;

}


/* =========================================================
   ORDERS
========================================================= */

function renderOrders() {

  const filterBox =
    document.querySelector(
      "#orderFilter"
    );

  const ordersList =
    document.querySelector(
      "#ordersList"
    );


  if (!ordersList) return;


  const filter =
    filterBox
      ? filterBox.value
      : "All";


  const orders =
    getOrders().filter(
      (order) =>
        filter === "All" ||
        order.orderStatus === filter
    );


  ordersList.innerHTML =
    orders.length

      ? orders
          .map(
            (order) => `

          <article class="order">

            <div class="order-head">

              <div>

                <strong>
                  ${
                    order.invoiceNumber ||
                    "Order"
                  }
                </strong>

                <p>
                  ${
                    escapeAttr(
                      order.customerName ||
                      ""
                    )
                  }
                  •
                  ${
                    escapeAttr(
                      order.customerPhone ||
                      ""
                    )
                  }
                </p>

              </div>


              <span class="badge">
                ${
                  order.orderStatus ||
                  "Paid"
                }
              </span>

            </div>


            <div class="order-items">

              ${
                (order.items || [])
                  .map(
                    (item) =>
                      `${item.qty} × ${escapeAttr(item.name)}`
                  )
                  .join("<br>")
              }

            </div>


            <p>

              ${
                escapeAttr(
                  order.orderType ||
                  ""
                )
              }

              •

              ${
                escapeAttr(
                  order.scheduleText ||
                  "ASAP"
                )
              }

              •

              Total
              ${money(order.total)}

            </p>


            <select
              data-id="${
                escapeAttr(
                  order.invoiceNumber ||
                  order.paymentId ||
                  ""
                )
              }"
            >

              ${
                [
                  "Paid",
                  "Preparing",
                  "Ready",
                  "Out for Delivery",
                  "Completed",
                  "Cancelled"
                ]

                  .map(
                    (status) =>
                      `<option
                        ${
                          status ===
                          (
                            order.orderStatus ||
                            "Paid"
                          )
                            ? "selected"
                            : ""
                        }
                      >
                        ${status}
                      </option>`
                  )

                  .join("")
              }

            </select>

          </article>

        `
          )
          .join("")

      : `

        <div class="order">
          No orders in this view yet.
        </div>

      `;


  document
    .querySelectorAll(
      "[data-id]"
    )
    .forEach(
      (select) => {

        select.onchange =
          () => {

            const all =
              getOrders();


            const target =
              all.find(
                (x) =>
                  (
                    x.invoiceNumber ||
                    x.paymentId
                  ) ===
                  select.dataset.id
              );


            if (target) {

              target.orderStatus =
                select.value;

            }


            localStorage.setItem(

              "tdcAdminOrders",

              JSON.stringify(all)

            );


            renderStats();
            renderOrders();

          };

      }
    );

}


/* =========================================================
   CATEGORY OPTIONS
========================================================= */

function renderCategoryOptions() {

  const datalist =
    document.querySelector(
      "#categoryOptions"
    );


  if (!datalist) return;


  datalist.innerHTML =
    [
      ...new Set(
        allMenuItems()
          .map(
            (x) =>
              x.category
          )
      )
    ]

      .sort()

      .map(
        (category) =>
          `<option value="${escapeAttr(category)}"></option>`
      )

      .join("");

}


/* =========================================================
   INVENTORY / MENU
========================================================= */

function renderInventory() {

  const inventoryList =
    document.querySelector(
      "#inventoryList"
    );


  if (!inventoryList) return;


  const overrides =
    getOverrides();

  const items =
    allMenuItems();


  inventoryList.innerHTML =
    items.length

      ? items
          .map(
            (item, index) => {

              const override =
                overrides[
                  item.name
                ] || {};


              const stock =
                Number.isFinite(
                  Number(
                    override.stock
                  )
                )

                  ? override.stock

                  : Number.isFinite(
                      Number(
                        item.stock
                      )
                    )

                    ? item.stock

                    : 999;


              const description =
                override.description ||
                item.description ||
                "";


              const image =
                override.image ||
                item.image ||
                "";


              const available =
                override.available !==
                  false &&
                item.available !== false;


              const bestseller =
                override.bestseller ===
                  true ||
                item.bestseller ===
                  true;


              return `

                <article class="item">

                  <div>

                    <div class="item-head">

                      <div>

                        <strong>
                          ${
                            escapeAttr(
                              item.name
                            )
                          }
                        </strong>

                        <div class="badge">

                          ${
                            escapeAttr(
                              item.category
                            )
                          }

                          ${
                            item.custom
                              ? " • Custom"
                              : ""
                          }

                        </div>

                      </div>


                      <strong>
                        ${money(item.price)}
                      </strong>

                    </div>

                  </div>


                  <div class="item-fields">

                    <input
                      id="d${index}"
                      placeholder="Short description"
                      value="${escapeAttr(description)}"
                    >


                    <input
                      id="s${index}"
                      type="number"
                      min="0"
                      value="${stock}"
                      title="Stock"
                    >


                    <label class="switch">

                      <input
                        id="a${index}"
                        type="checkbox"
                        ${
                          available
                            ? "checked"
                            : ""
                        }
                      >

                      Available

                    </label>


                    <textarea
                      id="t${index}"
                      placeholder="Detailed item description"
                    >${escapeAttr(description)}</textarea>


                    <input
                      id="p${index}"
                      type="url"
                      placeholder="Food image URL (https://...)"
                      value="${escapeAttr(image)}"
                    >


                    <label class="switch">

                      <input
                        id="b${index}"
                        type="checkbox"
                        ${
                          bestseller
                            ? "checked"
                            : ""
                        }
                      >

                      Bestseller

                    </label>


                    <div class="item-actions">

                      <button
                        class="save"
                        data-save="${index}"
                      >
                        Save item
                      </button>


                      <button
                        class="delete-item"
                        data-delete="${index}"
                      >
                        Remove item
                      </button>

                    </div>

                  </div>

                </article>

              `;

            }
          )

          .join("")

      : `

        <div class="order">
          No menu items.
          Use “Add New Item” above.
        </div>

      `;


  document
    .querySelectorAll(
      "[data-save]"
    )
    .forEach(
      (button) => {

        button.onclick =
          () => {

            const index =
              Number(
                button.dataset.save
              );


            const item =
              items[index];


            const all =
              getOverrides();


            all[item.name] = {

              ...(all[item.name] || {}),

              description:
                document
                  .querySelector(
                    `#t${index}`
                  )
                  .value
                  .trim() ||

                document
                  .querySelector(
                    `#d${index}`
                  )
                  .value
                  .trim(),

              stock:
                Number(
                  document
                    .querySelector(
                      `#s${index}`
                    )
                    .value
                ),

              available:
                document
                  .querySelector(
                    `#a${index}`
                  )
                  .checked,

              image:
                document
                  .querySelector(
                    `#p${index}`
                  )
                  .value
                  .trim(),

              bestseller:
                document
                  .querySelector(
                    `#b${index}`
                  )
                  .checked

            };


            localStorage.setItem(

              "tdcCatalogOverrides",

              JSON.stringify(all)

            );


            button.textContent =
              "Saved ✓";


            setTimeout(
              () => {

                button.textContent =
                  "Save item";

              },

              1200

            );

          };

      }
    );


  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      (button) => {

        button.onclick =
          () => {

            const item =
              items[
                Number(
                  button.dataset.delete
                )
              ];


            if (
              !confirm(
                `Remove “${item.name}” from the customer menu?`
              )
            ) {

              return;

            }


            if (item.custom) {

              saveCustomItems(

                getCustomItems()
                  .filter(
                    (x) =>
                      x.name !==
                      item.name
                  )

              );

            } else {

              saveRemovedItems([

                ...getRemovedItems(),

                item.name

              ]);

            }


            const all =
              getOverrides();


            delete all[
              item.name
            ];


            localStorage.setItem(

              "tdcCatalogOverrides",

              JSON.stringify(all)

            );


            renderInventory();
            renderCategoryOptions();

          };

      }
    );


  renderCategoryOptions();

}


/* =========================================================
   ADD NEW MENU ITEM
========================================================= */

function addNewItem() {

  const name =
    document
      .querySelector(
        "#newName"
      )
      .value
      .trim();


  const category =
    document
      .querySelector(
        "#newCategory"
      )
      .value
      .trim();


  const price =
    Number(
      document
        .querySelector(
          "#newPrice"
        )
        .value
    );


  const stock =
    Number(
      document
        .querySelector(
          "#newStock"
        )
        .value || 999
    );


  const message =
    document.querySelector(
      "#addItemMessage"
    );


  message.textContent = "";


  if (
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price <= 0
  ) {

    message.textContent =
      "Enter item name, category and a valid price.";

    return;

  }


  if (
    allMenuItems()
      .some(
        (item) =>
          item.name
            .toLowerCase() ===
          name.toLowerCase()
      )
  ) {

    message.textContent =
      "An item with this name already exists.";

    return;

  }


  const item = {

    id:
      `custom-${Date.now()}`,

    name,

    category,

    price:
      Math.round(price),

    description:
      document
        .querySelector(
          "#newDescription"
        )
        .value
        .trim(),

    image:
      document
        .querySelector(
          "#newImage"
        )
        .value
        .trim(),

    stock:
      Number.isFinite(stock) &&
      stock >= 0

        ? stock

        : 999,

    available:
      document
        .querySelector(
          "#newAvailable"
        )
        .checked,

    bestseller:
      document
        .querySelector(
          "#newBestseller"
        )
        .checked,

    custom: true

  };


  saveCustomItems([

    ...getCustomItems(),

    item

  ]);


  const overrides =
    getOverrides();


  overrides[item.name] = {

    description:
      item.description,

    image:
      item.image,

    stock:
      item.stock,

    available:
      item.available,

    bestseller:
      item.bestseller

  };


  localStorage.setItem(

    "tdcCatalogOverrides",

    JSON.stringify(
      overrides
    )

  );


  [
    "newName",
    "newPrice",
    "newCategory",
    "newDescription",
    "newImage"
  ]

    .forEach(
      (id) => {

        const input =
          document.querySelector(
            `#${id}`
          );

        if (input) {

          input.value = "";

        }

      }
    );


  document.querySelector(
    "#newStock"
  ).value = "999";


  document.querySelector(
    "#newAvailable"
  ).checked = true;


  document.querySelector(
    "#newBestseller"
  ).checked = false;


  message.textContent =
    `${name} added to the menu ✓`;


  renderInventory();

}


/* =========================================================
   TABS
========================================================= */

document
  .querySelectorAll(
    ".tab"
  )
  .forEach(
    (button) => {

      button.onclick =
        () => {

          document
            .querySelectorAll(
              ".tab, .panel"
            )
            .forEach(
              (element) =>
                element.classList
                  .remove(
                    "active"
                  )
            );


          button.classList.add(
            "active"
          );


          const panel =
            document.querySelector(
              `#${button.dataset.tab}`
            );


          if (panel) {

            panel.classList.add(
              "active"
            );

          }

        };

    }
  );


/* =========================================================
   ORDER FILTER
========================================================= */

const orderFilter =
  document.querySelector(
    "#orderFilter"
  );


if (orderFilter) {

  orderFilter.onchange =
    renderOrders;

}


/* =========================================================
   ADD ITEM BUTTON
========================================================= */

const addNewItemButton =
  document.querySelector(
    "#addNewItem"
  );


if (addNewItemButton) {

  addNewItemButton.onclick =
    addNewItem;

}


/* =========================================================
   RESET CATALOG
========================================================= */

const resetCatalogButton =
  document.querySelector(
    "#resetCatalog"
  );


if (resetCatalogButton) {

  resetCatalogButton.onclick =
    () => {

      if (
        confirm(
          "Reset all local menu changes, including added and removed items?"
        )
      ) {

        localStorage.removeItem(
          "tdcCatalogOverrides"
        );

        localStorage.removeItem(
          CUSTOM_KEY
        );

        localStorage.removeItem(
          REMOVED_KEY
        );

        renderInventory();

      }

    };

}


/* =========================================================
   PROMO CODES
========================================================= */

function getPromos() {

  return safeJson(
    PROMO_KEY,
    []
  );

}


function setPromos(promos) {

  localStorage.setItem(

    PROMO_KEY,

    JSON.stringify(promos)

  );


  renderPromos();

}


function renderPromos() {

  const box =
    document.querySelector(
      "#promoList"
    );


  if (!box) return;


  const promos =
    getPromos();


  box.innerHTML =
    promos.length

      ? promos
          .map(
            (promo, index) => `

              <article class="inventory-row">

                <div>

                  <strong>
                    ${escapeAttr(promo.code)}
                  </strong>

                  <small>

                    ${
                      promo.audience ===
                      "all"

                        ? "All Users • reusable"

                        : promo.audience ===
                          "new"

                          ? "New Users Only"

                          : "Special • once per number"
                    }

                    •

                    ${
                      promo.discountType ===
                      "percent"

                        ? `${promo.value}%`

                        : `₹${promo.value}`
                    }

                    off

                    ${
                      promo.minOrder
                        ? ` • Min ₹${promo.minOrder}`
                        : ""
                    }

                    ${
                      promo.validUntil
                        ? ` • Until ${escapeAttr(promo.validUntil)}`
                        : ""
                    }

                  </small>

                </div>


                <div class="inventory-actions">

                  <label class="switch">

                    <input
                      type="checkbox"
                      data-pactive="${index}"
                      ${
                        promo.active !==
                        false
                          ? "checked"
                          : ""
                      }
                    >

                    Active

                  </label>


                  <button
                    data-pdelete="${index}"
                    class="danger"
                  >
                    Delete
                  </button>

                </div>

              </article>

            `
          )

          .join("")

      : `

        <p>
          No promo codes created yet.
        </p>

      `;


  box
    .querySelectorAll(
      "[data-pactive]"
    )
    .forEach(
      (input) => {

        input.onchange =
          () => {

            const promos =
              getPromos();


            promos[
              Number(
                input.dataset.pactive
              )
            ].active =
              input.checked;


            setPromos(promos);

          };

      }
    );


  box
    .querySelectorAll(
      "[data-pdelete]"
    )
    .forEach(
      (button) => {

        button.onclick =
          () => {

            if (
              !confirm(
                "Delete this promo?"
              )
            ) {

              return;

            }


            const promos =
              getPromos();


            promos.splice(

              Number(
                button.dataset.pdelete
              ),

              1

            );


            setPromos(promos);

          };

      }
    );

}


/* =========================================================
   SAVE PROMO
========================================================= */

const savePromoButton =
  document.querySelector(
    "#savePromo"
  );


if (savePromoButton) {

  savePromoButton.onclick =
    () => {

      const code =
        document
          .querySelector(
            "#promoCode"
          )
          .value
          .trim()
          .toUpperCase();


      const value =
        Number(
          document
            .querySelector(
              "#promoValue"
            )
            .value
        );


      const message =
        document.querySelector(
          "#promoAdminMsg"
        );


      if (
        !code ||
        !value
      ) {

        message.textContent =
          "Enter a promo code and discount value.";

        return;

      }


      let promos =
        getPromos();


      if (
        promos.some(
          (promo) =>
            promo.code === code
        )
      ) {

        message.textContent =
          "This promo code already exists.";

        return;

      }


      promos.unshift({

        code,

        audience:
          document
            .querySelector(
              "#promoAudience"
            )
            .value,

        discountType:
          document
            .querySelector(
              "#promoDiscountType"
            )
            .value,

        value,

        minOrder:
          Number(
            document
              .querySelector(
                "#promoMinOrder"
              )
              .value || 0
          ),

        maxDiscount:
          Number(
            document
              .querySelector(
                "#promoMaxDiscount"
              )
              .value || 0
          ),

        validFrom:
          document
            .querySelector(
              "#promoFrom"
            )
            .value,

        validUntil:
          document
            .querySelector(
              "#promoUntil"
            )
            .value,

        usageLimit:
          Number(
            document
              .querySelector(
                "#promoUsageLimit"
              )
              .value || 0
          ),

        used: 0,

        active:
          document
            .querySelector(
              "#promoActive"
            )
            .checked

      });


      setPromos(promos);


      message.textContent =
        `${code} saved ✓`;


      document.querySelector(
        "#promoCode"
      ).value = "";


      document.querySelector(
        "#promoValue"
      ).value = "";

    };

}


/* =========================================================
   INITIAL RENDER
========================================================= */

renderStats();
renderOrders();
renderInventory();
renderPromos();


/* =========================================================
   START AUTH CHECK LAST
========================================================= */

setAdminUi(false);

checkAdminSession();
