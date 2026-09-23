"use client";

import { useEffect, useState } from "react";
import api from "@/helper/api.interceptor";
import "./Home.css";

export default function Home() {
  const [menu, setMenu] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);

  const [openCategory, setOpenCategory] = useState(null);

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
        {/* MORNING BANNER */}

        <div
          className="menu-banner morning-banner"
          onClick={() => toggleMenu("morning")}
        >
          <h2>Morning Menu</h2>

          {!(openMenu === "morning") && <span>+</span>}
        </div>

        {/* MORNING CATEGORIES */}

        {openMenu === "morning" && (
          <div className="categories">
            {menu?.morning_menu?.map((category) => (
              <Category
                key={category.category_id}
                category={category}
                openCategory={openCategory}
                toggleCategory={toggleCategory}
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
        {/* ALL DAY BANNER */}

        <div
          className="menu-banner all-day-banner"
          onClick={() => toggleMenu("allDay")}
        >
          <h2>All Day Menu</h2>

          {!(openMenu === "allDay") && <span>+</span>}
        </div>

        {/* ALL DAY CATEGORIES */}

        {openMenu === "allDay" && (
          <div className="categories">
            {menu?.all_day_menu?.map((category) => (
              <Category
                key={category.category_id}
                category={category}
                openCategory={openCategory}
                toggleCategory={toggleCategory}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* FLOATING MENU */}
      {/* ========================= */}

      <button
        className="floating-menu"
        onClick={() => {
          setOpenMenu(null);
          setOpenCategory(null);
        }}
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

function Category({ category, openCategory, toggleCategory }) {
  const isOpen = openCategory === category.category_id;

  return (
    <div className={`category ${isOpen ? "category-open" : ""}`}>
      {/* ========================= */}
      {/* CATEGORY HEADER */}
      {/* ========================= */}

      <div
        className="category-header"
        onClick={() => toggleCategory(category.category_id)}
      >
        <h3>{category.category_name}</h3>

        <span>{isOpen ? "−" : "+"}</span>
      </div>

      {/* ========================= */}
      {/* PRODUCTS */}
      {/* ========================= */}

      {isOpen && (
        <div className="products">
          {category.products?.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================= */
/* PRODUCT CARD */
/* ================================================= */

function ProductCard({ product }) {
  const [selectedPreference, setSelectedPreference] = useState("Regular");

  const variations = product.product_variations || [];

  const [selectedVariation, setSelectedVariation] = useState(null);

  const hasPreference =
    product.jain_available === 1 || product.swaminarayan_available === 1;

  const hasVariations = variations.length > 0;

  const variationPrice = selectedVariation
    ? Number(selectedVariation.price || 0)
    : 0;

  const finalPrice = Number(product.price || 0) + variationPrice;

  return (
    <div className="product-card">
      <img src={product.product_image} alt={product.product_name} />

      <div className="product-info">
        <h4>{product.product_name}</h4>

        {product.minimum_quantity && (
          <span className="minimum">Min qty: {product.minimum_quantity}</span>
        )}

        {product.atf_special === 1 && (
          <img
            className="atf-special"
            src="/images/atf-special.png"
            alt="ATF Special"
          />
        )}

        {product.coming_soon === 1 && (
          <div className="coming-soon">Coming Soon</div>
        )}

        {/* SIZE / VARIATION */}
        {hasVariations && (
          <div className="variations">
            <span className="variation-label">Add-ons:</span>

            {/* REGULAR */}
            <label className="variation-option">
              <input
                type="radio"
                name={`variation-${product.product_id}`}
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
                  name={`variation-${product.product_id}`}
                  checked={
                    selectedVariation?.variation_id === variation.variation_id
                  }
                  onChange={() => setSelectedVariation(variation)}
                />

                <span>{variation.variation_name}</span>

                {variation.price && (
                  <span className="variation-price">+₹{variation.price}</span>
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
              <button
                type="button"
                className={`preference-option ${
                  selectedPreference === "Regular" ? "active" : ""
                }`}
                onClick={() => setSelectedPreference("Regular")}
              >
                Regular
              </button>

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

        {product.description && (
          <p className="description">{product.description}</p>
        )}

        {product.coming_soon !== 1 && (
          <div className="product-bottom">
            <span className="price">₹{finalPrice}</span>

            <button
              type="button"
              className="add-button"
              onClick={() => {
                console.log("ADD PRODUCT:", {
                  product,
                  preference: hasPreference ? selectedPreference : null,
                  variation: selectedVariation,
                  price: finalPrice,
                });
              }}
            >
              ADD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
