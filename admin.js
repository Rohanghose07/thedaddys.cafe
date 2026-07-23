"use strict";

/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient = window.supabaseClient;

if (!supabaseClient) {
  console.error("Supabase client is missing. Check supabase-config.js.");
}


/* =========================================================
   ADMIN AUTH ELEMENTS
========================================================= */

const adminLoginGate = document.getElementById("adminLoginGate");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPass = document.getElementById("adminPass");
const adminLoginError = document.getElementById("adminLoginError");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

const dashboardHeader = document.querySelector("header");
const dashboardMain = document.querySelector("main");


/* =========================================================
   ADMIN UI
========================================================= */

function setAdminUi(loggedIn) {
  if (adminLoginGate) {
    adminLoginGate.style.display = loggedIn ? "none" : "flex";
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.style.display = loggedIn ? "block" : "none";
  }

  if (dashboardHeader) {
    dashboardHeader.style.display = loggedIn ? "" : "none";
  }

  if (dashboardMain) {
    dashboardMain.style.display = loggedIn ? "" : "none";
  }
}


/* =========================================================
   VERIFY ADMIN
========================================================= */

async function verifyAdmin(userId) {
  try {
    const { data, error } = await supabaseClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Admin verification failed:", error);
      return false;
    }

    return Boolean(data);

  } catch (error) {
    console.error("Admin verification error:", error);
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
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.error("Session check failed:", error);
      setAdminUi(false);
      return;
    }

    if (!session) {
      setAdminUi(false);
      return;
    }

    const isAdmin = await verifyAdmin(session.user.id);

    if (!isAdmin) {
      await supabaseClient.auth.signOut();

      if (adminLoginError) {
        adminLoginError.textContent =
          "This account is not authorised as an admin.";
      }

      setAdminUi(false);
      return;
    }

    setAdminUi(true);

    await loadMenuItems();

  } catch (error) {
    console.error("Session error:", error);
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

      const email = adminEmail?.value.trim() || "";
      const password = adminPass?.value || "";

      if (!email || !password) {
        adminLoginError.textContent =
          "Please enter your email and password.";
        return;
      }

      const loginButton =
        document.getElementById("adminLoginBtn");

      try {
        if (loginButton) {
          loginButton.disabled = true;
          loginButton.textContent = "SIGNING IN...";
        }

        adminLoginError.textContent = "Signing in...";

        const { data, error } =
          await supabaseClient.auth.signInWithPassword({
            email,
            password
          });

        if (error) {
          adminLoginError.textContent = error.message;
          return;
        }

        if (!data.user) {
          adminLoginError.textContent = "Login failed.";
          return;
        }

        const isAdmin = await verifyAdmin(data.user.id);

        if (!isAdmin) {
          await supabaseClient.auth.signOut();

          adminLoginError.textContent =
            "This account is not authorised to access the admin dashboard.";

          setAdminUi(false);
          return;
        }

        adminLoginError.textContent = "";

        if (adminPass) {
          adminPass.value = "";
        }

        setAdminUi(true);

        await loadMenuItems();

      } catch (error) {
        console.error("Login error:", error);

        adminLoginError.textContent =
          "Unable to sign in. Please try again.";

      } finally {
        if (loginButton) {
          loginButton.disabled = false;
          loginButton.textContent = "LOGIN";
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
        await supabaseClient.auth.signOut();
      } catch (error) {
        console.error("Logout failed:", error);
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
  supabaseClient.auth.onAuthStateChange(
    (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAdminUi(false);
      }
    }
  );
}


/* =========================================================
   SHARED MENU STATE
========================================================= */

let menuItems = [];


/* =========================================================
   HELPERS
========================================================= */

const money =
  (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function allMenuItems() {
  return menuItems.map(
    (item) => ({
      ...item,

      image:
        item.image_url || "",

      available:
        item.is_available !== false,

      bestseller:
        item.is_bestseller === true
    })
  );
}


/* =========================================================
   LOAD MENU FROM SUPABASE
========================================================= */

async function loadMenuItems() {
  try {
    const { data, error } =
      await supabaseClient
        .from("menu_items")
        .select("*")
        .order("category", {
          ascending: true
        })
        .order("name", {
          ascending: true
        });

    if (error) {
      console.error(
        "Could not load menu from Supabase:",
        error
      );

      alert(
        "Could not load menu from Supabase."
      );

      return;
    }

    menuItems = data || [];

    renderInventory();
    renderCategoryOptions();

  } catch (error) {
    console.error(
      "Menu load error:",
      error
    );
  }
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

const newImageFile =
  document.getElementById("newImageFile");

const newImagePreview =
  document.getElementById("newImagePreview");

const newImagePreviewWrap =
  document.getElementById("newImagePreviewWrap");

const newImageUploadStatus =
  document.getElementById("newImageUploadStatus");


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

      if (!allowedTypes.includes(file.type)) {
        alert(
          "Please upload a JPG, PNG or WebP image."
        );

        this.value = "";
        return;
      }

      const maxSize =
        6 * 1024 * 1024;

      if (file.size > maxSize) {
        alert(
          "Image must be smaller than 6 MB."
        );

        this.value = "";
        return;
      }

      const previewUrl =
        URL.createObjectURL(file);

      if (newImagePreview) {
        newImagePreview.src =
          previewUrl;
      }

      if (newImagePreviewWrap) {
        newImagePreviewWrap.style.display =
          "block";
      }
    }
  );
}


/* =========================================================
   UPLOAD IMAGE TO SUPABASE STORAGE
========================================================= */

async function uploadMenuImage(
  file,
  itemName
) {
  if (!file) {
    return "";
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Only JPG, PNG and WebP images are allowed."
    );
  }

  const maxSize =
    6 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Image must be smaller than 6 MB."
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  const safeName =
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
      ) || "menu-item";

  const filePath =
    `${safeName}-${Date.now()}.${extension}`;

  const {
    data,
    error
  } =
    await supabaseClient
      .storage
      .from("menu-images")
      .upload(
        filePath,
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
      "Storage upload error:",
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
      .from("menu-images")
      .getPublicUrl(
        data.path
      );

  if (!publicData?.publicUrl) {
    throw new Error(
      "Could not create public image URL."
    );
  }

  return publicData.publicUrl;
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
        menuItems
          .map(
            (item) =>
              item.category
          )
          .filter(Boolean)
      )
    ].sort();

  datalist.innerHTML =
    categories
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
    document.getElementById(
      "inventoryList"
    );

  if (!inventoryList) return;

  const items =
    allMenuItems();

  inventoryList.innerHTML =
    items.length

      ? items.map(
          (
            item,
            index
          ) => {

            const description =
              item.description || "";

            const image =
              item.image_url || "";

            const stock =
              Number.isFinite(
                Number(item.stock)
              )

                ? Number(item.stock)

                : 999;

            const available =
              item.is_available !== false;

            const bestseller =
              item.is_bestseller === true;

            return `

              <article class="item">

                <div>

                  <div class="item-head">

                    <div>

                      <strong>
                        ${escapeAttr(item.name)}
                      </strong>

                      <div class="badge">
                        ${escapeAttr(item.category || "")}
                      </div>

                    </div>

                    <strong>
                      ${money(item.price)}
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
          No menu items found.
        </div>
      `;


  /* =======================================================
     SAVE EXISTING ITEM
  ======================================================= */

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

            if (!item) return;

            const imageInput =
              document.getElementById(
                `p${index}`
              );

            const newImageFile =
              imageInput?.files?.[0] ||
              null;

            let imageUrl =
              item.image_url || "";

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

              const description =
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

                "";

              const stock =
                Number(
                  document
                    .getElementById(
                      `s${index}`
                    )
                    ?.value || 0
                );

              const available =
                Boolean(
                  document
                    .getElementById(
                      `a${index}`
                    )
                    ?.checked
                );

              const bestseller =
                Boolean(
                  document
                    .getElementById(
                      `b${index}`
                    )
                    ?.checked
                );

              const {
                error
              } =
                await supabaseClient
                  .from(
                    "menu_items"
                  )
                  .update({
                    description,
                    stock,
                    is_available:
                      available,
                    image_url:
                      imageUrl,
                    is_bestseller:
                      bestseller,
                    updated_at:
                      new Date()
                        .toISOString()
                  })
                  .eq(
                    "id",
                    item.id
                  );

              if (error) {
                throw error;
              }

              button.textContent =
                "Saved ✓";

              await loadMenuItems();

            } catch (error) {
              console.error(
                "Save item failed:",
                error
              );

              alert(
                error.message ||
                "Could not save this menu item."
              );

              button.disabled =
                false;

              button.textContent =
                "Save item";
            }

          };

      }
    );


  /* =======================================================
     DELETE ITEM
  ======================================================= */

  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      (button) => {

        button.onclick =
          async () => {

            const index =
              Number(
                button.dataset.delete
              );

            const item =
              items[index];

            if (!item) return;

            const confirmed =
              confirm(
                `Remove “${item.name}” from the menu?`
              );

            if (!confirmed) {
              return;
            }

            try {
              button.disabled =
                true;

              button.textContent =
                "Removing...";

              const {
                error
              } =
                await supabaseClient
                  .from(
                    "menu_items"
                  )
                  .delete()
                  .eq(
                    "id",
                    item.id
                  );

              if (error) {
                throw error;
              }

              await loadMenuItems();

            } catch (error) {
              console.error(
                "Delete failed:",
                error
              );

              alert(
                error.message ||
                "Could not remove this menu item."
              );

              button.disabled =
                false;

              button.textContent =
                "Remove item";
            }

          };

      }
    );

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

  const description =
    document
      .getElementById(
        "newDescription"
      )
      ?.value
      .trim() || "";

  const available =
    Boolean(
      document
        .getElementById(
          "newAvailable"
        )
        ?.checked
    );

  const bestseller =
    Boolean(
      document
        .getElementById(
          "newBestseller"
        )
        ?.checked
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
    message.textContent = "";
  }

  if (
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    if (message) {
      message.textContent =
        "Enter item name, category and a valid price.";
    }

    return;
  }

  const duplicate =
    menuItems.some(
      (item) =>
        String(item.name)
          .toLowerCase() ===
        name.toLowerCase()
    );

  if (duplicate) {
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

    let imageUrl = "";

    if (imageFile) {
      if (newImageUploadStatus) {
        newImageUploadStatus.textContent =
          "Uploading image...";
      }

      imageUrl =
        await uploadMenuImage(
          imageFile,
          name
        );

      if (newImageUploadStatus) {
        newImageUploadStatus.textContent =
          "Image uploaded ✓";
      }
    }

    const {
      error
    } =
      await supabaseClient
        .from(
          "menu_items"
        )
        .insert({
          name,
          category,

          price:
            Math.round(price),

          description,

          image_url:
            imageUrl,

          stock:
            Number.isFinite(stock) &&
            stock >= 0
              ? stock
              : 999,

          is_available:
            available,

          is_bestseller:
            bestseller
        });

    if (error) {
      throw error;
    }

    [
      "newName",
      "newPrice",
      "newCategory",
      "newDescription"
    ].forEach(
      (id) => {
        const input =
          document.getElementById(id);

        if (input) {
          input.value = "";
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
      imageInput.value = "";
    }

    if (newImagePreviewWrap) {
      newImagePreviewWrap.style.display =
        "none";
    }

    if (newImagePreview) {
      newImagePreview.src =
        "";
    }

    if (newImageUploadStatus) {
      newImageUploadStatus.textContent =
        "";
    }

    if (message) {
      message.textContent =
        `${name} added successfully ✓`;
    }

    await loadMenuItems();

  } catch (error) {
    console.error(
      "Add item failed:",
      error
    );

    if (message) {
      message.textContent =
        error.message ||
        "Failed to add this item.";
    }

    if (newImageUploadStatus) {
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
   STATS + ORDERS
   Still using current local order system for now
========================================================= */

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
      <small>Total orders</small>
      <strong>${orders.length}</strong>
    </div>

    <div class="stat">
      <small>Sales recorded</small>
      <strong>${money(sales)}</strong>
    </div>

    <div class="stat">
      <small>Average order value</small>
      <strong>${money(average)}</strong>
    </div>

    <div class="stat">
      <small>Open orders</small>
      <strong>${open}</strong>
    </div>

  `;
}

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
        order.orderStatus === filter
    );

  list.innerHTML =
    orders.length
      ? orders.map(
          (order) => `

          <article class="order">

            <div class="order-head">

              <div>

                <strong>
                  ${escapeAttr(
                    order.invoiceNumber ||
                    "Order"
                  )}
                </strong>

                <p>
                  ${escapeAttr(
                    order.customerName ||
                    ""
                  )}
                  •
                  ${escapeAttr(
                    order.customerPhone ||
                    ""
                  )}
                </p>

              </div>

              <span class="badge">
                ${escapeAttr(
                  order.orderStatus ||
                  "Paid"
                )}
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

              ${escapeAttr(
                order.orderType ||
                ""
              )}

              •

              ${escapeAttr(
                order.scheduleText ||
                "ASAP"
              )}

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
              JSON.stringify(all)
            );

            renderStats();
            renderOrders();

          };

      }
    );
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
                  .remove("active")
            );

          button
            .classList
            .add("active");

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
    async () => {

      alert(
        "Menu is now stored in Supabase. Reset is disabled to prevent deleting shared live menu data."
      );

    };
}


/* =========================================================
   PROMO CODES
   Still local for now
========================================================= */

const PROMO_KEY =
  "tdcPromos";

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
                ${escapeAttr(promo.code)}
              </strong>

              <small>

                ${
                  promo.audience === "all"
                    ? "All Users • reusable"
                    : promo.audience === "new"
                      ? "New Users Only"
                      : "Special • once per number"
                }

                •

                ${
                  promo.discountType === "percent"
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
                    promo.active !== false
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

            if (promos[index]) {
              promos[index].active =
                input.checked;
            }

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
          .toUpperCase() || "";

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

      if (!code || !value) {
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
            promo.code === code
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
            ?.value || "all",

        discountType:
          document
            .getElementById(
              "promoDiscountType"
            )
            ?.value || "percent",

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
            ?.value || "",

        validUntil:
          document
            .getElementById(
              "promoUntil"
            )
            ?.value || "",

        usageLimit:
          Number(
            document
              .getElementById(
                "promoUsageLimit"
              )
              ?.value || 0
          ),

        used: 0,

        active:
          Boolean(
            document
              .getElementById(
                "promoActive"
              )
              ?.checked
          )

      });

      setPromos(promos);

      if (message) {
        message.textContent =
          `${code} saved ✓`;
      }

      const codeInput =
        document.getElementById(
          "promoCode"
        );

      if (codeInput) {
        codeInput.value = "";
      }

      const valueInput =
        document.getElementById(
          "promoValue"
        );

      if (valueInput) {
        valueInput.value = "";
      }

    };
}


/* =========================================================
   INITIAL RENDER
========================================================= */

renderStats();
renderOrders();
renderPromos();

setAdminUi(false);

checkAdminSession();
