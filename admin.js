"use strict";

/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient = window.supabaseClient;

if (!supabaseClient) {
  console.error(
    "Supabase client is missing. Check supabase-config.js."
  );
}


/* =========================================================
   ADMIN AUTH ELEMENTS
========================================================= */

const adminLoginGate =
  document.getElementById("adminLoginGate");

const adminLoginForm =
  document.getElementById("adminLoginForm");

const adminEmail =
  document.getElementById("adminEmail");

const adminPass =
  document.getElementById("adminPass");

const adminLoginError =
  document.getElementById("adminLoginError");

const adminLogoutBtn =
  document.getElementById("adminLogoutBtn");

const dashboardHeader =
  document.querySelector("header");

const dashboardMain =
  document.querySelector("main");


/* =========================================================
   ADMIN UI
========================================================= */

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
   VERIFY ADMIN
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
      "Admin verification error:",
      error
    );

    return false;
  }

}


/* =========================================================
   CHECK ADMIN SESSION
========================================================= */

async function checkAdminSession() {

  if (!supabaseClient) {

    setAdminUi(false);

    return;
  }

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
          "This account is not authorised as an admin.";

      }

      setAdminUi(false);

      return;
    }

    setAdminUi(true);

  } catch (error) {

    console.error(
      "Session error:",
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
        adminEmail?.value
          .trim() || "";

      const password =
        adminPass?.value || "";

      if (!email || !password) {

        adminLoginError.textContent =
          "Please enter your email and password.";

        return;
      }

      const loginButton =
        document.getElementById(
          "adminLoginBtn"
        );

      try {

        if (loginButton) {

          loginButton.disabled = true;

          loginButton.textContent =
            "SIGNING IN...";
        }

        adminLoginError.textContent =
          "Signing in...";

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

          adminLoginError.textContent =
            error.message;

          return;
        }

        if (!data.user) {

          adminLoginError.textContent =
            "Login failed.";

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

          adminLoginError.textContent =
            "This account is not authorised to access the admin dashboard.";

          setAdminUi(false);

          return;
        }

        adminLoginError.textContent =
          "";

        if (adminPass) {
          adminPass.value = "";
        }

        setAdminUi(true);

      } catch (error) {

        console.error(
          "Login error:",
          error
        );

        adminLoginError.textContent =
          "Unable to sign in. Please try again.";

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
   LOGOUT
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
          "Logout failed:",
          error
        );

      }

      if (adminPass) {
        adminPass.value = "";
      }

      if (adminLoginError) {
        adminLoginError.textContent = "";
      }

      setAdminUi(false);

    }
  );

}


/* =========================================================
   AUTH STATE
========================================================= */

if (supabaseClient) {

  supabaseClient
    .auth
    .onAuthStateChange(
      (event, session) => {

        if (
          event === "SIGNED_OUT" ||
          !session
        ) {

          setAdminUi(false);

        }

      }
    );

}


/* =========================================================
   BASE MENU
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
   LOCAL STORAGE KEYS
========================================================= */

const CUSTOM_KEY =
  "tdcCustomMenuItems";

const REMOVED_KEY =
  "tdcRemovedMenuItems";

const PROMO_KEY =
  "tdcPromos";


/* =========================================================
   HELPERS
========================================================= */

const money =
  (value) =>
    `₹${Number(value || 0)
      .toLocaleString("en-IN")}`;


function safeJson(
  key,
  fallback
) {

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

    JSON.stringify([
      ...new Set(items)
    ])

  );

}


function escapeAttr(value) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    );

}


function allMenuItems() {

  const removed =
    new Set(
      getRemovedItems()
    );


  return [

    ...BASE_MENU.map(
      (item) => ({
        ...item,
        custom: false
      })
    ),

    ...getCustomItems().map(
      (item) => ({
        ...item,
        custom: true
      })
    )

  ].filter(
    (item) =>
      !removed.has(
        item.name
      )
  );

}


/* =========================================================
   IMAGE FILE PREVIEW
========================================================= */

const newImageFile =
  document.getElementById(
    "newImageFile"
  );

const newImagePreview =
  document.getElementById(
    "newImagePreview"
  );

const newImagePreviewWrap =
  document.getElementById(
    "newImagePreviewWrap"
  );

const newImageUploadStatus =
  document.getElementById(
    "newImageUploadStatus"
  );


if (newImageFile) {

  newImageFile.addEventListener(
    "change",
    function () {

      const file =
        this.files?.[0];

      if (!file) {

        if (newImagePreviewWrap) {
          newImagePreviewWrap.style.display =
            "none";
        }

        if (newImagePreview) {
          newImagePreview.src = "";
        }

        return;
      }


      const allowedTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        alert(
          "Please upload a JPG, PNG or WebP image."
        );

        this.value = "";

        return;
      }


      const maxFileSize =
        6 * 1024 * 1024;


      if (
        file.size >
        maxFileSize
      ) {

        alert(
          "Image must be smaller than 6 MB."
        );

        this.value = "";

        return;
      }


      const previewUrl =
        URL.createObjectURL(
          file
        );


      if (newImagePreview) {

        newImagePreview.src =
          previewUrl;

      }


      if (
        newImagePreviewWrap
      ) {

        newImagePreviewWrap.style.display =
          "block";

      }

    }
  );

}


/* =========================================================
   UPLOAD IMAGE TO SUPABASE
========================================================= */

async function uploadMenuImage(
  file,
  itemName
) {

  if (!file) {

    return "";

  }


  if (!supabaseClient) {

    throw new Error(
      "Supabase connection is unavailable."
    );

  }


  const allowedTypes = [

    "image/jpeg",

    "image/png",

    "image/webp"

  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {

    throw new Error(
      "Only JPG, PNG and WebP images are allowed."
    );

  }


  const maxFileSize =
    6 * 1024 * 1024;


  if (
    file.size >
    maxFileSize
  ) {

    throw new Error(
      "Image must be smaller than 6 MB."
    );

  }


  const rawExtension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp"
  ];


  const extension =
    allowedExtensions.includes(
      rawExtension
    )
      ? rawExtension
      : "jpg";


  const safeItemName =
    String(itemName)

      .toLowerCase()

      .trim()

      .replace(
        /[^a-z0-9]+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        ""
      ) ||

    "menu-item";


  const uniqueName =

    `${safeItemName}-${Date.now()}.${extension}`;


  const {
    data,
    error
  } =
    await supabaseClient

      .storage

      .from(
        "menu-images"
      )

      .upload(

        uniqueName,

        file,

        {

          cacheControl:
            "3600",

          upsert:
            false,

          contentType:
            file.type

        }

      );


  if (error) {

    console.error(
      "Image upload error:",
      error
    );

    throw new Error(
      error.message ||
      "Image upload failed."
    );

  }


  const {
    data: publicData
  } =
    supabaseClient

      .storage

      .from(
        "menu-images"
      )

      .getPublicUrl(
        data.path
      );


  if (
    !publicData?.publicUrl
  ) {

    throw new Error(
      "Could not generate the public image URL."
    );

  }


  return (
    publicData.publicUrl
  );

}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

  const stats =
    document.getElementById(
      "stats"
    );

  if (!stats) return;


  const orders =
    getOrders();


  const completed =
    orders.filter(
      (order) =>
        order.orderStatus !==
        "Cancelled"
    );


  const sales =
    completed.reduce(

      (
        total,
        order
      ) =>

        total +
        Number(
          order.total || 0
        ),

      0

    );


  const average =
    completed.length

      ? Math.round(
          sales /
          completed.length
        )

      : 0;


  const open =
    orders.filter(
      (order) =>

        ![
          "Completed",
          "Cancelled"
        ].includes(
          order.orderStatus
        )
    ).length;


  stats.innerHTML = `

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
        ${open}
      </strong>

    </div>

  `;

}


/* =========================================================
   ORDERS
========================================================= */

function renderOrders() {

  const list =
    document.getElementById(
      "ordersList"
    );

  if (!list) return;


  const filter =
    document.getElementById(
      "orderFilter"
    )?.value || "All";


  const orders =
    getOrders().filter(
      (order) =>

        filter === "All" ||

        order.orderStatus ===
        filter
    );


  list.innerHTML =

    orders.length

      ? orders.map(
          (order) => `

          <article class="order">

            <div class="order-head">

              <div>

                <strong>

                  ${
                    escapeAttr(
                      order.invoiceNumber ||
                      "Order"
                    )
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
                  escapeAttr(
                    order.orderStatus ||
                    "Paid"
                  )
                }

              </span>

            </div>


            <div class="order-items">

              ${
                (order.items || [])

                  .map(
                    (item) =>

                      `${Number(item.qty || 0)} × ${escapeAttr(item.name)}`
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
                    (status) => `

                    <option
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
                    </option>

                  `
                  )

                  .join("")
              }

            </select>

          </article>

        `
        ).join("")

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
                (order) =>

                  (
                    order.invoiceNumber ||
                    order.paymentId
                  ) ===

                  select.dataset.id
              );


            if (target) {

              target.orderStatus =
                select.value;

            }


            localStorage.setItem(

              "tdcAdminOrders",

              JSON.stringify(
                all
              )

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
    document.getElementById(
      "categoryOptions"
    );

  if (!datalist) return;


  const categories =

    [
      ...new Set(

        allMenuItems().map(
          (item) =>
            item.category
        )

      )
    ].sort();


  datalist.innerHTML =

    categories.map(
      (category) =>

        `<option value="${escapeAttr(category)}"></option>`

    ).join("");

}


/* =========================================================
   INVENTORY / MENU
========================================================= */

function renderInventory() {

  const inventoryList =
    document.getElementById(
      "inventoryList"
    );

  if (!inventoryList) return;


  const overrides =
    getOverrides();

  const items =
    allMenuItems();


  inventoryList.innerHTML =

    items.length

      ? items.map(
          (
            item,
            index
          ) => {

            const override =
              overrides[
                item.name
              ] || {};


            const description =

              override.description ||

              item.description ||

              "";


            const image =

              override.image ||

              item.image ||

              "";


            const stock =

              Number.isFinite(
                Number(
                  override.stock
                )
              )

                ? Number(
                    override.stock
                  )

                : Number.isFinite(
                    Number(
                      item.stock
                    )
                  )

                  ? Number(
                      item.stock
                    )

                  : 999;


            const available =

              override.available !==
                false &&

              item.available !==
                false;


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

                      ${
                        money(
                          item.price
                        )
                      }

                    </strong>

                  </div>

                </div>


                ${
                  image

                    ? `

                    <div style="margin:12px 0;">

                      <img

                        src="${escapeAttr(image)}"

                        alt="${escapeAttr(item.name)}"

                        loading="lazy"

                        style="
                          width:160px;
                          max-width:100%;
                          height:120px;
                          object-fit:cover;
                          border-radius:12px;
                          border:1px solid #333;
                        "

                      >

                    </div>

                  `

                    : `

                    <div
                      style="
                        margin:12px 0;
                        color:#888;
                        font-size:13px;
                      "
                    >
                      No image uploaded
                    </div>

                  `
                }


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


                  <div>

                    <label
                      for="p${index}"
                      style="
                        display:block;
                        margin-bottom:6px;
                        font-weight:700;
                      "
                    >
                      ${
                        image
                          ? "Replace Image"
                          : "Upload Image"
                      }
                    </label>


                    <input

                      id="p${index}"

                      type="file"

                      accept="image/jpeg,image/png,image/webp"

                    >

                  </div>


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
        ).join("")

      : `

        <div class="order">

          No menu items.

          Use “Add New Item” above.

        </div>

      `;


  /* SAVE ITEM */

  document
    .querySelectorAll(
      "[data-save]"
    )
    .forEach(
      (button) => {

        button.onclick =
          async () => {

            const index =
              Number(
                button.dataset.save
              );


            const item =
              items[index];


            if (!item) {

              return;

            }


            const all =
              getOverrides();


            let imageUrl =

              all[item.name]?.image ||

              item.image ||

              "";


            const imageInput =
              document.getElementById(
                `p${index}`
              );


            const newImageFile =

              imageInput?.files?.[0] ||

              null;


            try {

              button.disabled =
                true;


              button.textContent =
                newImageFile

                  ? "Uploading..."

                  : "Saving...";


              if (newImageFile) {

                imageUrl =

                  await uploadMenuImage(

                    newImageFile,

                    item.name

                  );

              }


              all[item.name] = {

                ...(all[item.name] || {}),

                description:

                  document
                    .getElementById(
                      `t${index}`
                    )
                    ?.value
                    .trim()

                  ||

                  document
                    .getElementById(
                      `d${index}`
                    )
                    ?.value
                    .trim()

                  ||

                  "",


                stock:

                  Number(
                    document
                      .getElementById(
                        `s${index}`
                      )
                      ?.value || 0
                  ),


                available:

                  Boolean(
                    document
                      .getElementById(
                        `a${index}`
                      )
                      ?.checked
                  ),


                image:

                  imageUrl,


                bestseller:

                  Boolean(
                    document
                      .getElementById(
                        `b${index}`
                      )
                      ?.checked
                  )

              };


              localStorage.setItem(

                "tdcCatalogOverrides",

                JSON.stringify(
                  all
                )

              );


              button.textContent =
                "Saved ✓";


              setTimeout(
                () => {

                  renderInventory();

                },

                600
              );

            } catch (error) {

              console.error(
                "Save menu item failed:",
                error
              );


              alert(

                error.message ||

                "Could not save the menu item."

              );


              button.disabled =
                false;


              button.textContent =
                "Save item";

            }

          };

      }
    );


  /* DELETE ITEM */

  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      (button) => {

        button.onclick =
          () => {

            const index =
              Number(
                button.dataset.delete
              );


            const item =
              items[index];


            if (!item) {

              return;

            }


            if (

              !confirm(

                `Remove “${item.name}” from the customer menu?`

              )

            ) {

              return;

            }


            if (item.custom) {

              saveCustomItems(

                getCustomItems().filter(

                  (customItem) =>

                    customItem.name !==
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

              JSON.stringify(
                all
              )

            );


            renderInventory();

            renderCategoryOptions();

          };

      }
    );


  renderCategoryOptions();

}


/* =========================================================
   ADD NEW ITEM
========================================================= */

async function addNewItem() {

  const name =
    document
      .getElementById(
        "newName"
      )
      ?.value
      .trim() || "";


  const category =
    document
      .getElementById(
        "newCategory"
      )
      ?.value
      .trim() || "";


  const price =
    Number(
      document
        .getElementById(
          "newPrice"
        )
        ?.value
    );


  const stock =
    Number(
      document
        .getElementById(
          "newStock"
        )
        ?.value || 999
    );


  const message =
    document.getElementById(
      "addItemMessage"
    );


  const imageInput =
    document.getElementById(
      "newImageFile"
    );


  const imageFile =
    imageInput?.files?.[0] ||
    null;


  if (message) {

    message.textContent =
      "";

  }


  if (

    !name ||

    !category ||

    !Number.isFinite(
      price
    ) ||

    price <= 0

  ) {

    if (message) {

      message.textContent =
        "Enter item name, category and a valid price.";

    }

    return;

  }


  if (

    allMenuItems().some(

      (item) =>

        item.name
          .toLowerCase() ===

        name
          .toLowerCase()

    )

  ) {

    if (message) {

      message.textContent =
        "An item with this name already exists.";

    }

    return;

  }


  const addButton =
    document.getElementById(
      "addNewItem"
    );


  try {

    if (addButton) {

      addButton.disabled =
        true;


      addButton.textContent =

        imageFile

          ? "Uploading image..."

          : "Adding item...";

    }


    let imageUrl =
      "";


    if (imageFile) {

      if (
        newImageUploadStatus
      ) {

        newImageUploadStatus.textContent =
          "Uploading image...";

      }


      imageUrl =

        await uploadMenuImage(

          imageFile,

          name

        );


      if (
        newImageUploadStatus
      ) {

        newImageUploadStatus.textContent =
          "Image uploaded ✓";

      }

    }


    const item = {

      id:

        `custom-${Date.now()}`,


      name,


      category,


      price:

        Math.round(
          price
        ),


      description:

        document
          .getElementById(
            "newDescription"
          )
          ?.value
          .trim() || "",


      image:

        imageUrl,


      stock:

        Number.isFinite(
          stock
        ) &&

        stock >= 0

          ? stock

          : 999,


      available:

        Boolean(

          document
            .getElementById(
              "newAvailable"
            )
            ?.checked

        ),


      bestseller:

        Boolean(

          document
            .getElementById(
              "newBestseller"
            )
            ?.checked

        ),


      custom:

        true

    };


    saveCustomItems([

      ...getCustomItems(),

      item

    ]);


    const overrides =
      getOverrides();


    overrides[
      item.name
    ] = {

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
      "newDescription"
    ].forEach(
      (id) => {

        const input =
          document.getElementById(
            id
          );

        if (input) {

          input.value =
            "";

        }

      }
    );


    const stockInput =
      document.getElementById(
        "newStock"
      );


    if (stockInput) {

      stockInput.value =
        "999";

    }


    const availableInput =
      document.getElementById(
        "newAvailable"
      );


    if (availableInput) {

      availableInput.checked =
        true;

    }


    const bestsellerInput =
      document.getElementById(
        "newBestseller"
      );


    if (bestsellerInput) {

      bestsellerInput.checked =
        false;

    }


    if (imageInput) {

      imageInput.value =
        "";

    }


    if (
      newImagePreviewWrap
    ) {

      newImagePreviewWrap.style.display =
        "none";

    }


    if (
      newImagePreview
    ) {

      newImagePreview.src =
        "";

    }


    if (
      newImageUploadStatus
    ) {

      newImageUploadStatus.textContent =
        "";

    }


    if (message) {

      message.textContent =

        `${name} added successfully ✓`;

    }


    renderInventory();

    renderCategoryOptions();

  } catch (error) {

    console.error(
      "Add item failed:",
      error
    );


    if (message) {

      message.textContent =

        error.message ||

        "Failed to upload image or add item.";

    }


    if (
      newImageUploadStatus
    ) {

      newImageUploadStatus.textContent =
        "";

    }

  } finally {

    if (addButton) {

      addButton.disabled =
        false;


      addButton.textContent =
        "+ Add Item";

    }

  }

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

                element
                  .classList
                  .remove(
                    "active"
                  )

            );


          button.classList.add(
            "active"
          );


          const panel =
            document.getElementById(
              button.dataset.tab
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
  document.getElementById(
    "orderFilter"
  );


if (orderFilter) {

  orderFilter.onchange =
    renderOrders;

}


/* =========================================================
   ADD ITEM BUTTON
========================================================= */

const addNewItemButton =
  document.getElementById(
    "addNewItem"
  );


if (addNewItemButton) {

  addNewItemButton.onclick =
    addNewItem;

}


/* =========================================================
   RESET CATALOG
========================================================= */

const resetCatalogButton =
  document.getElementById(
    "resetCatalog"
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

        renderCategoryOptions();

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

    JSON.stringify(
      promos
    )

  );


  renderPromos();

}


function renderPromos() {

  const box =
    document.getElementById(
      "promoList"
    );


  if (!box) return;


  const promos =
    getPromos();


  box.innerHTML =

    promos.length

      ? promos.map(
          (
            promo,
            index
          ) => `

          <article class="inventory-row">

            <div>

              <strong>

                ${
                  escapeAttr(
                    promo.code
                  )
                }

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
        ).join("")

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


            const index =
              Number(
                input.dataset.pactive
              );


            if (
              promos[index]
            ) {

              promos[index].active =
                input.checked;

            }


            setPromos(
              promos
            );

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


            setPromos(
              promos
            );

          };

      }
    );

}


/* =========================================================
   SAVE PROMO
========================================================= */

const savePromoButton =
  document.getElementById(
    "savePromo"
  );


if (savePromoButton) {

  savePromoButton.onclick =
    () => {

      const code =
        document
          .getElementById(
            "promoCode"
          )
          ?.value
          .trim()
          .toUpperCase() ||
        "";


      const value =
        Number(
          document
            .getElementById(
              "promoValue"
            )
            ?.value
        );


      const message =
        document.getElementById(
          "promoAdminMsg"
        );


      if (
        !code ||
        !value
      ) {

        if (message) {

          message.textContent =
            "Enter a promo code and discount value.";

        }

        return;

      }


      const promos =
        getPromos();


      if (

        promos.some(
          (promo) =>
            promo.code ===
            code
        )

      ) {

        if (message) {

          message.textContent =
            "This promo code already exists.";

        }

        return;

      }


      promos.unshift({

        code,


        audience:

          document
            .getElementById(
              "promoAudience"
            )
            ?.value ||
          "all",


        discountType:

          document
            .getElementById(
              "promoDiscountType"
            )
            ?.value ||
          "percent",


        value,


        minOrder:

          Number(

            document
              .getElementById(
                "promoMinOrder"
              )
              ?.value || 0

          ),


        maxDiscount:

          Number(

            document
              .getElementById(
                "promoMaxDiscount"
              )
              ?.value || 0

          ),


        validFrom:

          document
            .getElementById(
              "promoFrom"
            )
            ?.value ||
          "",


        validUntil:

          document
            .getElementById(
              "promoUntil"
            )
            ?.value ||
          "",


        usageLimit:

          Number(

            document
              .getElementById(
                "promoUsageLimit"
              )
              ?.value || 0

          ),


        used:

          0,


        active:

          Boolean(

            document
              .getElementById(
                "promoActive"
              )
              ?.checked

          )

      });


      setPromos(
        promos
      );


      if (message) {

        message.textContent =

          `${code} saved ✓`;

      }


      const codeInput =
        document.getElementById(
          "promoCode"
        );


      if (codeInput) {

        codeInput.value =
          "";

      }


      const valueInput =
        document.getElementById(
          "promoValue"
        );


      if (valueInput) {

        valueInput.value =
          "";

      }

    };

}


/* =========================================================
   INITIAL RENDER
========================================================= */

renderStats();

renderOrders();

renderInventory();

renderPromos();

renderCategoryOptions();


/* =========================================================
   START SECURELY
========================================================= */

setAdminUi(false);

checkAdminSession();
