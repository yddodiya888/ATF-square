"use client";

import { useEffect, useState } from "react";
import api from "@/helper/api.interceptor";
import "./Home.css";
const CART_STORAGE_KEY = "atf_cart";

export default function Home() {
  const [menu, setMenu] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    async function getMenu() {
      try {
        const data = await api.GetMenuItems();
        console.log("MENU RESPONSE:", data);
        if (data.success === 1) {
          setMenu(data.data);
        }
      } catch (error) {
        console.error("MENU ERROR:", error);
      }
    }

    getMenu();
  }, []);
  // LOAD CART AFTER MOUNT
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("CART LOAD ERROR:", error);
    } finally {
      setCartHydrated(true);
    }
  }, []);

  // SAVE CART ONLY AFTER localStorage HAS BEEN LOADED
  useEffect(() => {
    if (!cartHydrated) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("CART SAVE ERROR:", error);
    }
  }, [cart, cartHydrated]);

  /* ========================= */
  /* MAIN MENU TOGGLE */
  /* ========================= */

  const toggleMenu = (menuName) => {
    if (openMenu === menuName) {
      setOpenMenu(null);
      setOpenCategory(null);
    } else {
      setOpenMenu(menuName);
      setOpenCategory(null);
    }
  };

  /* ========================= */
  /* CATEGORY TOGGLE */
  /* ========================= */

  const toggleCategory = (categoryId) => {
    if (openCategory === categoryId) {
      setOpenCategory(null);
    } else {
      setOpenCategory(categoryId);
    }
  };

  /* ========================= */
  /* CART */
  /* ========================= */

  const createCartItemId = ({ product, preference, variation, addons }) => {
    const addonIds = addons
      .map((addon) => addon.addon_id)
      .sort()
      .join("-");

    return [
      product.product_id,
      preference || "",
      variation?.variation_id || "",
      addonIds,
    ].join("|");
  };

  const addToCart = ({ product, preference, variation, addons, price }) => {
    const cartItemId = createCartItemId({
      product,
      preference,
      variation,
      addons,
    });

    const minimumQuantity = Number(product.minimum_quantity) || 1;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity + minimumQuantity,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          cartItemId,
          product,
          preference,
          variation,
          addons,
          price,
          quantity: minimumQuantity,
        },
      ];
    });
  };

  const updateCartQuantity = (cartItemId, quantity) => {
    setCart((currentCart) => {
      if (quantity <= 0) {
        return currentCart;
      }

      return currentCart.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity,
            }
          : item,
      );
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.cartItemId !== cartItemId),
    );
  };
  const clearAllCart = () => {
    setCart([]);
    setCartOpen(false);
  };

  const handlePlaceOrder = () => {
    console.log("PLACE ORDER:", cart);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  /* ========================= */
  /* SHORTCUT CATEGORY */
  /* ========================= */

  const goToCategory = (menuName, categoryId) => {
    // Close shortcut menu
    setShortcutOpen(false);

    // Open correct main menu
    setOpenMenu(menuName);

    // Open selected category
    setOpenCategory(categoryId);

    // Wait for React to render
    setTimeout(() => {
      const element = document.getElementById(`${menuName}-${categoryId}`);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  return (
    <div className="home">
      {/* ========================= */}
      {/* LOGO */}
      {/* ========================= */}

      <div className="logo">
        <img src="/images/atf-logo.png" alt="ATF Square" />
      </div>

      {/* ========================= */}
      {/* MORNING MENU */}
      {/* ========================= */}

      <div
        className={`menu-section ${openMenu === "morning" ? "menu-open" : ""}`}
      >
        <div
          className="menu-banner morning-banner"
          onClick={() => toggleMenu("morning")}
        >
          <h2>Morning Menu</h2>

          {!(openMenu === "morning") && <span>+</span>}
        </div>

        {openMenu === "morning" && (
          <div className="categories">
            {menu?.morning_menu?.map((category) => (
              <Category
                key={category.category_id}
                menuName="morning"
                category={category}
                openCategory={openCategory}
                toggleCategory={toggleCategory}
                cart={cart}
                addToCart={addToCart}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* ALL DAY MENU */}
      {/* ========================= */}

      <div
        className={`menu-section ${openMenu === "allDay" ? "menu-open" : ""}`}
      >
        <div
          className="menu-banner all-day-banner"
          onClick={() => toggleMenu("allDay")}
        >
          <h2>All Day Menu</h2>

          {!(openMenu === "allDay") && <span>+</span>}
        </div>

        {openMenu === "allDay" && (
          <div className="categories">
            {menu?.all_day_menu?.map((category) => (
              <Category
                key={category.category_id}
                menuName="allDay"
                category={category}
                openCategory={openCategory}
                toggleCategory={toggleCategory}
                cart={cart}
                addToCart={addToCart}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* MENU POPUP */}
      {/* ========================= */}

      {shortcutOpen && (
        <div className="menu-popup-overlay">
          <div
            className={`menu-popup ${cart.length > 0 ? "cart-visible" : ""}`}
          >
            <div className="menu-popup-header">
              <h3>Menu</h3>

              <button
                type="button"
                className="menu-popup-close"
                onClick={() => setShortcutOpen(false)}
              >
                ×
              </button>
            </div>

            {/* MORNING MENU */}

            <div className="shortcut-title">Morning Menu</div>

            {menu?.morning_menu?.map((category) => (
              <button
                key={category.category_id}
                type="button"
                className="shortcut-category"
                onClick={() => goToCategory("morning", category.category_id)}
              >
                <span>{category.category_name}</span>

                <span>{category.products?.length || 0}</span>
              </button>
            ))}

            {/* ALL DAY MENU */}

            <div className="shortcut-title all-day-title">All Day Menu</div>

            {menu?.all_day_menu?.map((category) => (
              <button
                key={category.category_id}
                type="button"
                className="shortcut-category"
                onClick={() => goToCategory("allDay", category.category_id)}
              >
                <span>{category.category_name}</span>

                <span>{category.products?.length || 0}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* CART BUTTON */}
      {/* ========================= */}

      {cart.length > 0 && (
        <button
          className="cart-button"
          onClick={() => {
            setCartOpen(true);
            setShortcutOpen(false);
          }}
        >
          CART ({cartCount})
        </button>
      )}
      {/* ========================= */}
      {/* CART POPUP */}
      {/* ========================= */}

      {cartOpen && (
        <div className="cart-popup-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-popup" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}

            <div className="cart-popup-header">
              <h3>Cart</h3>

              <button
                type="button"
                className="cart-popup-close"
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </div>

            {/* CART ITEMS */}

            <div className="cart-items">
              {cart.map((item) => {
                const productImage = item.product.product_image
                  ? new URL(item.product.product_image).searchParams.get(
                      "src",
                    ) || item.product.product_image
                  : "";

                const itemTotal = Number(item.price || 0) * item.quantity;

                return (
                  <div key={item.cartItemId} className="cart-item">
                    {/* IMAGE */}

                    {productImage && (
                      <img
                        src={productImage}
                        alt={item.product.product_name}
                        className="cart-item-image"
                      />
                    )}

                    {/* DETAILS */}

                    <div className="cart-item-details">
                      <h4>{item.product.product_name}</h4>

                      {/* PREFERENCE */}

                      {item.preference && (
                        <div className="cart-detail">
                          Preference: {item.preference}
                        </div>
                      )}

                      {/* VARIATION */}

                      {item.variation && (
                        <div className="cart-detail">
                          {item.variation.variation_name}
                        </div>
                      )}

                      {/* EXTRAS */}

                      {item.addons?.length > 0 && (
                        <div className="cart-detail">
                          Extras:
                          <div className="cart-addons">
                            {item.addons.map((addon) => (
                              <span key={addon.addon_id}>
                                {addon.multiple_addon_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PRICE + QUANTITY */}

                      <div className="cart-item-bottom">
                        <span className="cart-item-price">₹{itemTotal}</span>

                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                return;
                              }

                              updateCartQuantity(
                                item.cartItemId,
                                item.quantity - 1,
                              );
                            }}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.cartItemId,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {/* CLEAR PRODUCT */}

                      <button
                        type="button"
                        className="cart-clear"
                        onClick={() => removeFromCart(item.cartItemId)}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CART TOTAL */}

            <div className="cart-total">
              <span>Total</span>

              <strong>
                ₹
                {cart.reduce(
                  (total, item) =>
                    total + Number(item.price || 0) * item.quantity,
                  0,
                )}
              </strong>
            </div>

            <div className="cart-actions">
              <button
                type="button"
                className="clear-all-button"
                onClick={clearAllCart}
              >
                Clear All
              </button>

              <button
                type="button"
                className="place-order-button"
                onClick={handlePlaceOrder}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* FLOATING MENU */}
      {/* ========================= */}

      <button
        className="floating-menu"
        onClick={() => setShortcutOpen((current) => !current)}
      >
        <span>🍴</span>
        <small>Menu</small>
      </button>
    </div>
  );
}

/* ================================================= */
/* CATEGORY COMPONENT */
/* ================================================= */

function Category({
  menuName,
  category,
  openCategory,
  toggleCategory,
  cart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
}) {
  const isOpen = openCategory === category.category_id;

  const categoryImage = category.category_image
    ? new URL(category.category_image).searchParams.get("src")
    : null;

  return (
    <div
      id={`${menuName}-${category.category_id}`}
      className={`category ${isOpen ? "category-open" : ""}`}
    >
      <div
        className={`category-header ${
          categoryImage ? "has-category-image" : ""
        }`}
        onClick={() => toggleCategory(category.category_id)}
      >
        {categoryImage && (
          <img
            className="category-image"
            src={categoryImage}
            alt={category.category_name}
          />
        )}

        <h3>{category.category_name}</h3>

        <span>{isOpen ? "−" : "+"}</span>
      </div>

      {isOpen && (
        <div className="products">
          {category.products?.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              cart={cart}
              addToCart={addToCart}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================= */
/* PRODUCT CARD */
/* ================================================= */

function ProductCard({
  product,
  cart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
}) {
  const [selectedPreference, setSelectedPreference] = useState("Regular");

  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  const [selectedVariation, setSelectedVariation] = useState(null);

  const [selectedAddons, setSelectedAddons] = useState([]);

  const variations = product.product_variations || [];

  const addons = product.multiple_addons || [];

  const hasPreference =
    product.jain_available === 1 || product.swaminarayan_available === 1;

  const hasVariations = variations.length > 0;

  const hasAddons = addons.length > 0;

  /* ========================= */
  /* AVAILABILITY */
  /* ========================= */

  const checkAvailability = () => {
    const availability = product.availability;

    // No availability data = not available
    if (!availability) {
      return false;
    }

    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const today = days[new Date().getDay()];

    return availability[today] === 1;
  };

  const availableDays = product.availability
    ? Object.entries(product.availability)
        .filter(([, value]) => value === 1)
        .map(([day]) => day)
    : [];

  const formatDay = (day) => day.charAt(0).toUpperCase() + day.slice(1);

  const handleAddProduct = () => {
    if (!checkAvailability()) {
      setAvailabilityOpen(true);
      return;
    }

    addProduct();
  };

  /* ========================= */
  /* PRODUCT IMAGE */
  /* ========================= */

  const productImage = product.product_image
    ? new URL(product.product_image).searchParams.get("src") ||
      product.product_image
    : "";

  /* ========================= */
  /* VARIATION PRICE */
  /* ========================= */

  const variationPrice = selectedVariation
    ? Number(selectedVariation.price || 0)
    : 0;

  /* ========================= */
  /* ADDONS PRICE */
  /* ========================= */

  const addonsPrice = selectedAddons.reduce(
    (total, addon) => total + Number(addon.multiple_addon_price || 0),
    0,
  );

  /* FINAL PRICE */

  /* ========================= */

  const finalPrice = Number(product.price || 0) + variationPrice + addonsPrice;

  /* CART ITEM ID */

  const cartItemId = [
    product.product_id,
    hasPreference ? selectedPreference : "",
    selectedVariation?.variation_id || "",
    selectedAddons
      .map((addon) => addon.addon_id)
      .sort()
      .join("-"),
  ].join("|");

  const cartItem = cart.find((item) => item.cartItemId === cartItemId);

  const quantity = cartItem?.quantity || 0;

  /* ADD / REMOVE ADDON */

  const toggleAddon = (addon) => {
    setSelectedAddons((current) => {
      const exists = current.some((item) => item.addon_id === addon.addon_id);

      if (exists) {
        return current.filter((item) => item.addon_id !== addon.addon_id);
      }
      return [...current, addon];
    });
  };

  /* ========================= */
  /* ADD PRODUCT */
  /* ========================= */

  const addProduct = () => {
    addToCart({
      product,
      preference: hasPreference ? selectedPreference : null,
      variation: selectedVariation,
      addons: selectedAddons,
      price: finalPrice,
    });
  };

  /* ========================= */
  /* QUANTITY */
  /* ========================= */

  const increaseQuantity = () => {
    if (!cartItem) return;

    updateCartQuantity(cartItem.cartItemId, cartItem.quantity + 1);
  };

  const decreaseQuantity = () => {
    if (!cartItem) return;

    // Quantity cannot go below 1
    if (cartItem.quantity <= 1) {
      return;
    }

    updateCartQuantity(cartItem.cartItemId, cartItem.quantity - 1);
  };

  return (
    <div className="product-card">
      {/* PRODUCT IMAGE */}

      {productImage && <img src={productImage} alt={product.product_name} />}

      <div className="product-info">
        {/* PRODUCT NAME */}

        <h4 className="product-name">
          {product.product_name}

          {product.jain_available === 1 && (
            <img
              className="jain-icon"
              src="/images/jain.png"
              alt="Jain available"
            />
          )}

          {product.swaminarayan_available === 1 && (
            <img
              className="swaminarayan-icon"
              src="/images/swami-narayan.png"
              alt="Swaminarayan available"
            />
          )}

          {product.pre_order === 1 && (
            <img
              className="preorder-icon"
              src="/images/pre-order.svg"
              alt="Pre-order"
            />
          )}
        </h4>

        {/* BADGES */}

        <div className="product-badges">
          {product.minimum_quantity && (
            <span className="minimum">Min qty: {product.minimum_quantity}</span>
          )}

          {product.serving_qty && product.serving_unit && (
            <span className="serving">
              {product.serving_qty} {product.serving_unit}
            </span>
          )}
        </div>

        {/* ATF SPECIAL */}

        {product.atf_special === 1 && (
          <img
            className="atf-special"
            src="/images/atf_special.svg"
            alt="ATF Special"
          />
        )}

        {/* COMING SOON */}

        {product.coming_soon === 1 && (
          <div className="coming-soon">Coming Soon</div>
        )}

        {/* DESCRIPTION */}

        {product.description && (
          <p className="description">{product.description}</p>
        )}

        {/* MULTIPLE ADDONS */}

        {hasAddons && (
          <div className="multiple-addons">
            <span className="addon-label">Extras:</span>

            {addons.map((addon) => {
              const checked = selectedAddons.some(
                (item) => item.addon_id === addon.addon_id,
              );

              return (
                <label key={addon.addon_id} className="addon-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAddon(addon)}
                  />

                  <span>{addon.multiple_addon_name}</span>

                  {Number(addon.multiple_addon_price) > 0 && (
                    <span className="addon-price">
                      +₹
                      {addon.multiple_addon_price}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        {/* PRODUCT VARIATIONS */}

        {hasVariations && (
          <div className="variations">
            <span className="variation-label">Add-ons:</span>

            {/* REGULAR */}

            <label className="variation-option">
              <input
                type="radio"
                name={`addon-${product.product_id}`}
                checked={selectedVariation === null}
                onChange={() => setSelectedVariation(null)}
              />

              <span>Regular</span>
            </label>

            {/* API VARIATIONS */}

            {variations.map((variation) => (
              <label key={variation.variation_id} className="variation-option">
                <input
                  type="radio"
                  name={`addon-${product.product_id}`}
                  checked={
                    selectedVariation?.variation_id === variation.variation_id
                  }
                  onChange={() => setSelectedVariation(variation)}
                />

                <span>{variation.variation_name}</span>

                {Number(variation.price || 0) > 0 && (
                  <span className="variation-price">
                    +₹
                    {variation.price}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

        {/* PREFERENCE */}

        {hasPreference && (
          <div className="preferences">
            <span className="preference-label">Preference:</span>

            <div className="preference-options">
              {/* REGULAR */}

              <button
                type="button"
                className={`preference-option ${
                  selectedPreference === "Regular" ? "active" : ""
                }`}
                onClick={() => setSelectedPreference("Regular")}
              >
                Regular
              </button>

              {/* JAIN */}

              {product.jain_available === 1 && (
                <button
                  type="button"
                  className={`preference-option ${
                    selectedPreference === "Jain" ? "active" : ""
                  }`}
                  onClick={() => setSelectedPreference("Jain")}
                >
                  Jain
                </button>
              )}

              {/* SWAMINARAYAN */}

              {product.swaminarayan_available === 1 && (
                <button
                  type="button"
                  className={`preference-option ${
                    selectedPreference === "Swaminarayan" ? "active" : ""
                  }`}
                  onClick={() => setSelectedPreference("Swaminarayan")}
                >
                  Swaminarayan
                </button>
              )}
            </div>
          </div>
        )}

        {/* PRICE + ADD */}

        {product.coming_soon !== 1 && (
          <div className="product-bottom">
            <span className="price">₹{finalPrice}</span>

            {quantity === 0 ? (
              <button
                type="button"
                className="add-button"
                onClick={handleAddProduct}
              >
                ADD
              </button>
            ) : (
              <div className="quantity-control">
                <button
                  type="button"
                  className="quantity-button"
                  onClick={decreaseQuantity}
                >
                  −
                </button>

                <span className="quantity-number">{quantity}</span>

                <button
                  type="button"
                  className="quantity-button"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* AVAILABILITY POPUP */}
      {/* ========================= */}

      {availabilityOpen && (
        <div className="availability-overlay">
          <div className="availability-modal">
            <h3>Not available today</h3>

            <h4>{product.product_name}</h4>

            <p>
              {availableDays.length > 0
                ? "This item is available only on:"
                : "Availability information is not provided for this item."}
            </p>

            {availableDays.length > 0 && (
              <div className="available-days">
                {availableDays.map((day) => (
                  <span key={day}>{formatDay(day)}</span>
                ))}
              </div>
            )}

            <button
              type="button"
              className="availability-close"
              onClick={() => setAvailabilityOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
